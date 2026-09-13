import { getOAuthQuery } from "$lib/oauth-query";
import { Scope } from "$lib/scopes";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import type { MCIDOAuthClient } from "$lib/types/oauth";
import { z } from "zod";
import type { PageServerLoad } from "./$types";

const claimsSchema = z.object({ userinfo: z.record(z.string(), z.unknown()).optional() });

export const load = (async ({ url, request }) => {
  const params = url.searchParams;

  const client_id = params.get("client_id");
  const scope = params.get("scope")?.split(/\s+/).filter(Boolean);

  // Preserve only parameters covered by the provider's signature.
  const oauthQuery = getOAuthQuery(params);

  let requestedClaims: string[];
  try {
    const claims = claimsSchema.parse(JSON.parse(params.get("claims") || "{}"));
    requestedClaims = Object.keys(claims.userinfo ?? {});
  } catch {
    return { error: "invalid_request", error_description: "Invalid OpenID claims request.", status: 400 };
  }

  if (
    !oauthQuery ||
    !client_id ||
    !scope?.length ||
    scope.some((value) => !Object.values(Scope).includes(value as Scope))
  ) {
    return {
      error: "invalid_request",
      error_description:
        "This authorization request is incomplete or invalid. Please restart authorization from the app.",
      status: 400
    };
  }

  const oauthClientPublic = await auth.api.getOAuthClientPublic({
    query: {
      client_id // required,
    },
    // This endpoint requires session cookies.
    headers: request.headers
  });

  if (!oauthClientPublic) {
    return {
      error: "invalid_client",
      error_description: "Client not found.",
      status: 400
    };
  }

  const storedClient = await db.query.oauthClient.findFirst({
    where: (client, { eq }) => eq(client.clientId, client_id),
    columns: { metadata: true }
  });
  const oauthClient = {
    ...oauthClientPublic,
    ...((storedClient?.metadata ?? {}) as Partial<MCIDOAuthClient>)
  };

  return {
    oauthClient,
    scope,
    requestedClaims,
    oauthQuery
  };
}) satisfies PageServerLoad;
