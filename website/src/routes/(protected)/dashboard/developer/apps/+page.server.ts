import { Scope } from "$lib/scopes";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import type { OAuthClient } from "@better-auth/oauth-provider";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { appSchema, deleteAppSchema } from "./schema";

export const load = (async (event) => {
  const { locals, request } = event;

  if (!locals.user) redirect(303, "/login");

  try {
    const apps = await auth.api.getOAuthClients({
      headers: request.headers,
      request
    });

    return {
      appForm: await superValidate(zod(appSchema)),
      deleteAppForm: await superValidate(zod(deleteAppSchema)),
      appsData: apps
    };
  } catch (err) {
    console.error("Unexpected error during apps data fetch:", err);
    error(500, "Something went wrong trying to fetch your apps");
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  createApp: async (event) => {
    const { request, locals } = event;
    const form = await superValidate(event, zod(appSchema));

    let createdApp: OAuthClient;
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const email = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, locals.user?.id ?? ""),
        columns: { emailVerified: true }
      });

      // Check if user's email is verified
      if (!email?.emailVerified) {
        return fail(403, {
          form,
          error: "You must verify your email address before creating an OAuth application"
        });
      }

      // Always include openid and offline_access scopes for OIDC compatibility
      const clientScopes = [Scope.OPENID, ...form.data.scopes, Scope.OFFLINE_ACCESS];
      createdApp = await auth.api.adminCreateOAuthClient({
        headers: request.headers,
        request,
        body: {
          redirect_uris: form.data.redirectUris,
          token_endpoint_auth_method: "client_secret_basic",
          grant_types: ["authorization_code", "refresh_token"],
          response_types: ["code"],
          client_name: form.data.name,
          client_uri: form.data.uri,
          scope: clientScopes.join(" "),
          contacts: form.data.contacts,
          tos_uri: form.data.tosUri,
          policy_uri: form.data.policyUri,
          type: "web",
          skip_consent: false,
          logo_uri: form.data.logoUrl
          // metadata: {
          //   description: form.data.description,
          //   owner_user_id: locals.user?.id ?? "",
          //   trusted: false,
          //   verified: false,
          //   official: false
          // }
        }
      });
    } catch (err) {
      console.error("Error during app creation:", err);
      return fail(500, {
        form,
        error: "Internal server error during app creation"
      });
    }

    redirect(307, `/dashboard/developer/apps/${createdApp.client_id}`);
  }
};
