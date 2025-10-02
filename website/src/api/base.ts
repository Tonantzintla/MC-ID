import { authBase } from "$api/middlewares/auth";
import { betterAuthProviderMiddleware } from "$api/middlewares/better-auth";
import { dbProviderMiddleware } from "$api/middlewares/db";
import type { Auth } from "$lib/server/auth";
import type { RequestHeadersPluginContext } from "@orpc/server/plugins";

type ApiKeyData = NonNullable<Awaited<ReturnType<Auth["api"]["verifyApiKey"]>>["key"]>;

export interface ORPCContext extends RequestHeadersPluginContext {
  apiKey?: string;
  apiKeyData?: ApiKeyData;
}

// Extend from authBase to inherit UNAUTHORIZED and FORBIDDEN errors
export const base = authBase.$context<ORPCContext>().use(dbProviderMiddleware).use(betterAuthProviderMiddleware);
