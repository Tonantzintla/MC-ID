import { db } from "$lib/server/db";
import { oauthApplication } from "$lib/server/db/schema";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { createError, throwAPIError } from "./errors";
import { logger } from "./logger";

interface AppValidationResult {
  clientId: string;
  name: string | null;
}

export async function validateAppCredentials(appId: string, appSecret: string): Promise<AppValidationResult> {
  const startTime = Date.now();

  try {
    logger.debug("App authentication attempt", { appId });

    // Look up app by clientId
    const app = await db.query.oauthApplication.findFirst({
      where: eq(oauthApplication.clientId, appId)
    });

    if (!app) {
      logger.authAttempt(false, appId, { reason: "App not found" });
      throw createError.invalidCredentials("Invalid application credentials");
    }

    if (app.disabled) {
      logger.authAttempt(false, appId, { reason: "App disabled" });
      throw createError.forbidden("Application has been disabled");
    }

    if (!app.clientSecret) {
      logger.authAttempt(false, appId, { reason: "No secret configured" });
      throw createError.invalidCredentials("Application secret not configured");
    }

    // Verify the provided secret against the hashed secret
    let isValid = false;
    try {
      isValid = await verify(app.clientSecret, appSecret);
    } catch (verifyError) {
      logger.error("Error during secret verification", verifyError, { appId });
      throw createError.internal("Authentication verification failed");
    }

    if (!isValid) {
      logger.authAttempt(false, appId, { reason: "Invalid secret" });
      throw createError.invalidCredentials("Invalid application credentials");
    }

    const duration = Date.now() - startTime;
    logger.authAttempt(true, appId, { duration, appName: app.name });

    return {
      clientId: app.clientId!,
      name: app.name
    };
  } catch (error) {
    if (error instanceof Error && error.name === "APIError") {
      throw error;
    }

    logger.error("Unexpected error during app authentication", error, { appId });
    throw createError.internal("Authentication system error");
  }
}

// Middleware helper for endpoints that need app authentication
export async function requireAppAuth(appId: string, appSecret: string): Promise<AppValidationResult> {
  if (!appId || !appSecret) {
    throw throwAPIError(createError.validation("App ID and App Secret are required"));
  }

  return await validateAppCredentials(appId, appSecret);
}
