import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { SvelteURLSearchParams } from "svelte/reactivity";
import type { PageServerLoad } from "./$types";

export const load = (async ({ url }) => {
  const params = new SvelteURLSearchParams(url.searchParams.toString());

  const client_id = params.get("client_id");
  const scope = params.get("scope")?.split(" ");

  // Preserve the full query string for oauth_query parameter
  const oauthQuery = url.search.slice(1); // Remove leading '?'

  if (!client_id || !scope) {
    return {
      error: "invalid_request",
      error_description: `Missing required parameters: ${!client_id ? "client_id " : ""}${!scope ? "scope" : ""}`.trim(),
      status: 400
    };
  }

  const oauthClientRecord = await db.query.oauthClient.findFirst({
    where: (a) => eq(a.clientId, client_id),
    columns: {
      id: true,
      name: true,
      metadata: true,
      createdAt: true,
      disabled: true,
      scopes: true
    }
  });

  if (!oauthClientRecord) {
    return {
      error: "invalid_client",
      error_description: "Client not found.",
      status: 400
    };
  }

  const allowedScopes = oauthClientRecord.scopes ?? [];
  // Filter out openid and offline_access from validation as they are standard OIDC scopes
  const standardScopes = ["openid", "offline_access"];
  const customScopes = scope.filter((s) => !standardScopes.includes(s));
  const invalidScopes = customScopes.filter((s) => !allowedScopes.includes(s));
  if (invalidScopes.length > 0) {
    return {
      error: "invalid_scope",
      error_description: `The following scopes have not been enabled for this client: ${invalidScopes.join(", ")}`,
      status: 400
    };
  }

  return {
    oauthClient: oauthClientRecord,
    scope,
    oauthQuery
  };
}) satisfies PageServerLoad;
