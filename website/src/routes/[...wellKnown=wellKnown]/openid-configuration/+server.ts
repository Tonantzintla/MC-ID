import { auth } from "$lib/server/auth";
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
  const openIdConfigMetadata = oauthProviderOpenIdConfigMetadata(auth);
  return openIdConfigMetadata(request);
};
