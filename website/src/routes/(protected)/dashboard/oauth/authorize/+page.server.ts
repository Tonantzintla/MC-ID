import { Scope } from "$lib/scopes";
import { auth } from "$lib/server/auth";
import { SvelteURLSearchParams } from "svelte/reactivity";
import type { PageServerLoad } from "./$types";

export const load = (async ({ url, request }) => {
  const params = new SvelteURLSearchParams(url.searchParams.toString());

  const client_id = params.get("client_id");
  const scope = params.get("scope")?.split(" ");

  // Preserve the full query string for oauth_query parameter
  const oauthQuery = url.search.slice(1); // Remove leading '?'

  if (!client_id || !scope || !scope.includes(Scope.PROFILE)) {
    return {
      error: "invalid_request",
      error_description: `Missing required parameters: ${!client_id ? "client_id " : ""}${!scope ? "scope " : ""}${!scope?.includes(Scope.PROFILE) ? Scope.PROFILE + " scope" : ""}`.trim(),
      status: 400
    };
  }

  const oauthClientPublic = await auth.api.getOAuthClientPublic({
    query: {
      client_id // required,
    },
    // This endpoint requires session cookies.
    headers: request.headers,
    request
  });

  if (!oauthClientPublic) {
    return {
      error: "invalid_client",
      error_description: "Client not found.",
      status: 400
    };
  }

  return {
    oauthClient: oauthClientPublic,
    scope,
    oauthQuery
  };
}) satisfies PageServerLoad;
