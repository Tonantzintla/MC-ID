import { db } from "$lib/server/db";
import { verificationCodes } from "$lib/server/db/schema";
import { count, gte, lt } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Clean up expired verification codes from the database
 * This should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredCodes(): Promise<number> {
  try {
    logger.info("Starting cleanup of expired verification codes");

    const result = await db.delete(verificationCodes).where(lt(verificationCodes.expiration, new Date())).returning({ id: verificationCodes.id });

    const deletedCount = result.length;

    if (deletedCount > 0) {
      logger.info(`Cleaned up ${deletedCount} expired verification codes`);
    } else {
      logger.debug("No expired verification codes to clean up");
    }

    return deletedCount;
  } catch (error) {
    logger.error("Failed to cleanup expired verification codes", error);
    throw error;
  }
}

/**
 * Get statistics about verification codes
 */
export async function getCodeStatistics() {
  try {
    const now = new Date();

    const [totalResult, activeResult, expiredResult] = await Promise.all([db.select({ count: count() }).from(verificationCodes), db.select({ count: count() }).from(verificationCodes).where(gte(verificationCodes.expiration, now)), db.select({ count: count() }).from(verificationCodes).where(lt(verificationCodes.expiration, now))]);

    return {
      total: totalResult[0].count,
      active: activeResult[0].count,
      expired: expiredResult[0].count,
      timestamp: now.toISOString()
    };
  } catch (error) {
    logger.error("Failed to get code statistics", error);
    throw error;
  }
}
