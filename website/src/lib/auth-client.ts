import { env } from "$env/dynamic/public";
import type { Auth } from "$lib/server/auth";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { apiKeyClient, customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

const { PUBLIC_BASE_URL } = env;

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: PUBLIC_BASE_URL,
  plugins: [passkeyClient(), apiKeyClient(), customSessionClient<Auth>(), oauthProviderClient()]
});

export type Session = typeof authClient.$Infer.Session;
