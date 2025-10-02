import { db as database, type DB } from "$lib/server/db";
import { os } from "@orpc/server";

export const dbProviderMiddleware = os.$context<{ db?: DB }>().middleware(async ({ context, next }) => {
  /**
   * Why we should ?? here?
   * Because it can avoid `database` being used when unnecessary.
   * {@link https://orpc.unnoq.com/docs/best-practices/dedupe-middleware}
   */
  const db: DB = context.db ?? database;

  return next({
    context: {
      db
    }
  });
});
