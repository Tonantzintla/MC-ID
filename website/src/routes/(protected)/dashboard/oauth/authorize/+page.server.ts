import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { SvelteURLSearchParams } from "svelte/reactivity";
import type { PageServerLoad } from "./$types";

export const load = (async ({ url }) => {
  const params = new SvelteURLSearchParams(url.searchParams.toString());

  const consent_code = params.get("consent_code");
  const client_id = params.get("client_id");
  const scope = params.get("scope")?.split(" ");

  if (!consent_code || !client_id || !scope) {
    return {
      error: "invalid_request",
      error_description: `Missing required parameters: ${!consent_code ? "consent_code " : ""}${!client_id ? "client_id " : ""}${!scope ? "scope" : ""}`.trim(),
      status: 400
    };
  }

  const verification = await db.query.verification.findFirst({
    where: (v) => eq(v.identifier, consent_code),
    columns: {
      value: true
    }
  });

  if (!verification || !verification.value) {
    return {
      error: "invalid_grant",
      error_description: "Invalid or expired consent code.",
      status: 400
    };
  }

  const verificationValueData = JSON.parse(verification.value);

  if (verificationValueData.clientId !== client_id) {
    return {
      error: "invalid_client",
      error_description: "Client ID does not match consent code.",
      status: 400
    };
  }

  const oauthClient = await db.query.oauthApplication.findFirst({
    where: (a) => eq(a.clientId, verificationValueData.clientId),
    columns: {
      id: true,
      name: true,
      metadata: true,
      createdAt: true,
      disabled: true
    }
  });

  if (!oauthClient) {
    return {
      error: "invalid_client",
      error_description: "Client not found.",
      status: 400
    };
  }

  try {
    // Check if metadata is already an object or needs to be parsed
    const metadata = typeof oauthClient.metadata === "string" ? JSON.parse(oauthClient.metadata) : oauthClient.metadata;
    const allowedScopes = metadata.scopes || [];
    const invalidScopes = scope.filter((s) => !allowedScopes.includes(s));
    if (invalidScopes.length > 0) {
      return {
        error: "invalid_scope",
        error_description: `The following scopes have not been enabled for this client: ${invalidScopes.join(", ")}`,
        status: 400
      };
    }
  } catch (error) {
    console.error("Failed to parse client metadata:", error);
    return {
      error: "invalid_client",
      error_description: "Client configuration is malformed.",
      status: 400
    };
  }

  return {
    oauthClient,
    redirectURI: verificationValueData.redirectURI,
    consent_code,
    scope
  };
}) satisfies PageServerLoad;
