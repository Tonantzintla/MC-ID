import type { Permissions } from "$api/utils";
import { auth } from "$lib/server/auth";
import { CommonErrors, createError, ErrorTypes } from "./errors";
import { logger } from "./logger";

export async function validateApiKey(apiKey: string, requiredPermissions?: Permissions) {
  const startTime = Date.now();

  try {
    logger.debug("App authentication attempt", { apiKey });

    const key = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
        permissions: requiredPermissions
      }
    });

    if (!key) {
      logger.authAttempt(false, apiKey, { reason: "Invalid API key" });
      throw createError.invalidApiKey();
    }

    if (!key.valid) {
      logger.authAttempt(false, apiKey, { reason: "Revoked API key" });
      throw createError.forbidden("This API key is not valid or doesn't have the required permissions");
    }

    if (key.error) {
      logger.authAttempt(false, apiKey, { reason: key.error });
      throw createError.forbidden(key.error.message);
    }

    const duration = Date.now() - startTime;
    logger.authAttempt(true, apiKey, { duration });

    return {
      key
    };
  } catch (error) {
    if (error instanceof Error && error.name === "APIError") {
      throw error;
    }

    logger.error("Unexpected error during app authentication", error, { apiKey });
    throw createError.internal("Authentication system error");
  }
}

// Middleware helper for endpoints that need API key authentication
export async function requireApiKey(apiKey?: string | null, requiredPermissions?: Permissions) {
  if (!apiKey) {
    throw CommonErrors[ErrorTypes.VALIDATION_ERROR.statusCode];
  }

  const { key } = await validateApiKey(apiKey, requiredPermissions);

  if (!key.key || key.key === null) {
    throw createError.invalidApiKey();
  }

  return {
    ...key,
    key: key.key as NonNullable<typeof key.key>
  };
}
