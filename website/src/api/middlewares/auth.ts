import type { Permissions } from "$api/utils";
import { logger } from "$api/utils";
import { type Auth } from "$lib/server/auth";
import { os } from "@orpc/server";
import { z } from "zod";

// Define auth errors in a reusable base
export const authBase = os.errors({
  UNAUTHORIZED: {
    status: 401,
    message: "Authentication required",
    data: z
      .object({
        reason: z.string().optional()
      })
      .optional()
  },
  FORBIDDEN: {
    status: 403,
    message: "Insufficient permissions",
    data: z
      .object({
        reason: z.string().optional(),
        requiredPermissions: z.record(z.string(), z.array(z.string())).optional()
      })
      .optional()
  }
});

export const authMiddleware = (requiredPermissions?: Permissions) =>
  authBase.$context<{ auth: Auth; reqHeaders?: Headers }>().middleware(async ({ context, next, errors }) => {
    const { auth, reqHeaders } = context;

    // Extract API key from headers
    const apiKey = reqHeaders?.get("x-api-key");

    // Middleware helper for endpoints that need API key authentication
    if (!apiKey) {
      throw errors.UNAUTHORIZED({
        message: "No API key provided",
        data: { reason: "Missing X-API-Key header" }
      });
    }

    const key = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
        permissions: requiredPermissions
      }
    });

    if (!key) {
      logger.authAttempt(false, apiKey, { reason: "Invalid API key" });
      throw errors.UNAUTHORIZED({
        message: "The provided API key is invalid",
        data: { reason: "API key not found or invalid format" }
      });
    }

    if (!key.valid) {
      logger.authAttempt(false, apiKey, { reason: "Revoked API key" });
      throw errors.FORBIDDEN({
        message: "This API key is not valid or doesn't have the required permissions",
        data: {
          reason: "API key revoked or insufficient permissions",
          requiredPermissions
        }
      });
    }

    if (key.error) {
      throw errors.FORBIDDEN({
        message: key.error.message || "Something went wrong during API key validation",
        data: { reason: key.error.message }
      });
    }

    if (!key.key || key.key === null) {
      throw errors.UNAUTHORIZED({
        message: "The provided API key is invalid",
        data: { reason: "API key verification returned null" }
      });
    }

    logger.authAttempt(true, apiKey, { permissions: requiredPermissions });

    return next({
      context: {
        apiKey,
        apiKeyData: key.key
      }
    });
  });
