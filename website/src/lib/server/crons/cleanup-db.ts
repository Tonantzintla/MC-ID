import { db } from "$lib/server/db";
import { apikey, oauthAccessToken, oauthRefreshToken, session, verification, verificationCodes } from "$lib/server/db/schema";
import { and, isNotNull, lt, or } from "drizzle-orm";
import cron from "node-cron";

// Every hour, cleanup all expired entries in all tables that have an expiry column
export const cleanupDbCron = cron.createTask(
  "0 * * * *",
  async (ctx) => {
    const triggerTime = ctx.triggeredAt; // Use scheduled trigger time for all cleanup operations

    console.info(`[Cleanup] Starting database cleanup at ${triggerTime.toISOString()}`);
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

        // Cleanup expired OAuth access tokens
        db.delete(oauthAccessToken).where(and(isNotNull(oauthAccessToken.expiresAt), lt(oauthAccessToken.expiresAt, triggerTime))),

        // Cleanup expired or revoked OAuth refresh tokens
        db.delete(oauthRefreshToken).where(
          or(
            // Expired refresh tokens
            and(isNotNull(oauthRefreshToken.expiresAt), lt(oauthRefreshToken.expiresAt, triggerTime)),
            // Revoked refresh tokens (cleanup after some time)
            and(isNotNull(oauthRefreshToken.revoked), lt(oauthRefreshToken.revoked, triggerTime))
          )
        ),

        // Cleanup expired API keys
        db.delete(apikey).where(and(isNotNull(apikey.expiresAt), lt(apikey.expiresAt, triggerTime)))
      ]);

      console.info(`[Cleanup] Completed cleanup of all tables`);
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
