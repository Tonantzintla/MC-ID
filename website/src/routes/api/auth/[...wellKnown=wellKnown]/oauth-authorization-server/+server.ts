import { auth } from "$lib/server/auth";
import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
  const authServerMetadata = oauthProviderAuthServerMetadata(auth);
  return authServerMetadata(request);
};
