import { env } from "$env/dynamic/public";
import { passkeyClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

const { PUBLIC_BASE_URL } = env;

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: PUBLIC_BASE_URL,
  plugins: [passkeyClient(), usernameClient()],
  fetchOptions: {
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token"); // get the token from the response headers
      // Store the token securely (e.g., in localStorage)
      if (authToken) {
        localStorage.setItem("bearer_token", authToken);
      }
    }
  }
});

export type Session = typeof authClient.$Infer.Session;
