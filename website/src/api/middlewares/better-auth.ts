import { auth as betterAuth, type Auth } from "$lib/server/auth";
import { os } from "@orpc/server";

export const betterAuthProviderMiddleware = os.$context<{ auth?: Auth }>().middleware(async ({ context, next }) => {
  /**
   * Why we should ?? here?
   * Because it can avoid `database` being used when unnecessary.
   * {@link https://orpc.unnoq.com/docs/best-practices/dedupe-middleware}
   */
  const auth: Auth = context.auth ?? betterAuth;

  return next({
    context: {
      auth
    }
  });
});
