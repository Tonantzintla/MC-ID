import { db } from "$lib/server/db";
import { apikey, oauthAccessToken, session, verification, verificationCodes } from "$lib/server/db/schema";
import { and, isNotNull, isNull, lt, or } from "drizzle-orm";
import cron from "node-cron";

// Every hour, cleanup all expired entries in all tables that have an expiry column
export const cleanupDbCron = cron.createTask(
  "0 * * * *",
  async (ctx) => {
    const triggerTime = ctx.triggeredAt; // Use scheduled trigger time for all cleanup operations

    console.log(`[Cleanup] Starting database cleanup at ${triggerTime.toISOString()}`);
    console.time("[Cleanup] Duration");

    try {
      // Run all cleanup operations in parallel since they're independent
      await Promise.all([
        // Cleanup expired sessions
        db.delete(session).where(and(isNotNull(session.expiresAt), lt(session.expiresAt, triggerTime))),

        // Cleanup verification codes
        db.delete(verificationCodes).where(and(isNotNull(verificationCodes.expiration), lt(verificationCodes.expiration, triggerTime))),

        // Cleanup verifications
        db.delete(verification).where(and(isNotNull(verification.expiresAt), lt(verification.expiresAt, triggerTime))),

        // Cleanup OAuth access tokens where BOTH access and refresh tokens are expired
        // We keep tokens if the refresh token is still valid (can be used to get new access tokens)
        db.delete(oauthAccessToken).where(
          and(
            isNotNull(oauthAccessToken.accessTokenExpiresAt),
            lt(oauthAccessToken.accessTokenExpiresAt, triggerTime),
            or(
              // Either no refresh token expiration exists (no refresh token)
              isNull(oauthAccessToken.refreshTokenExpiresAt),
              // Or the refresh token is also expired
              and(isNotNull(oauthAccessToken.refreshTokenExpiresAt), lt(oauthAccessToken.refreshTokenExpiresAt, triggerTime))
            )
          )
        ),

        // Cleanup expired API keys
        db.delete(apikey).where(and(isNotNull(apikey.expiresAt), lt(apikey.expiresAt, triggerTime)))
      ]);

      console.log(`[Cleanup] Completed cleanup of all tables`);
    } catch (error) {
      console.error("[Cleanup] Error during database cleanup:", error);
    }
    console.timeEnd("[Cleanup] Duration");
  },
  {
    name: "cleanup-db",
    timezone: "Europe/Amsterdam"
  }
);
