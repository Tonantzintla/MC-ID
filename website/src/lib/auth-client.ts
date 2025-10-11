import { env } from "$env/dynamic/public";
import { apiKeyClient, passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

const { PUBLIC_BASE_URL } = env;

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: PUBLIC_BASE_URL,
  plugins: [passkeyClient(), apiKeyClient()]
});

export type Session = typeof authClient.$Infer.Session;
