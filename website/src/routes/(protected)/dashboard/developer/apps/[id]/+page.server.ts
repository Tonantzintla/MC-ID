import { Scope } from "$lib/scopes";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { oauthClient } from "$lib/shared/db/schema";
import type { MCIDOAuthClient } from "$lib/types/oauth";
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import { error, fail, isHttpError, redirect, type Actions } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { and, eq, sql } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { clientMetadata } from "../client";
import { appSchema, deleteAppSchema } from "../schema";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
  const { locals, params, request } = event;
  if (!locals.user) error(401, "Unauthorized");
  try {
    const app = (await auth.api.getOAuthClient({
      query: {
        client_id: params.id // required
      },
      // This endpoint requires session cookies.
      headers: request.headers
    })) as MCIDOAuthClient;

    if (!app) error(404, "App not found");

    const metadataResponse = await oauthProviderOpenIdConfigMetadata(auth)(request);
    const metadata = await metadataResponse.json();

    return {
      appForm: await superValidate(zod(appSchema), {
        defaults: {
          name: app.client_name || "",
          uri: app.client_uri,
          description: (app.description as string) || "",
          redirectUris: app.redirect_uris ?? [],
          id: app.client_id,
          contacts: app.contacts ?? [],
          tosUri: app.tos_uri,
          policyUri: app.policy_uri,
          scopes: (app.scope?.split(" ") as Scope[]) || [Scope.OPENID, Scope.OFFLINE_ACCESS],
          logoUrl: app.logo_uri,
          applicationType: app.application_type ?? "web",
          tokenEndpointAuthMethod: appSchema.shape.tokenEndpointAuthMethod.parse(
            app.token_endpoint_auth_method ?? "client_secret_basic"
          ),
          grantTypes: appSchema.shape.grantTypes.parse(app.grant_types ?? ["authorization_code"]),
          jwks: app.jwks ? JSON.stringify(app.jwks, null, 2) : "",
          jwksUri: app.jwks_uri,
          postLogoutRedirectUris: app.post_logout_redirect_uris ?? [],
          backchannelLogoutUri: app.backchannel_logout_uri,
          backchannelLogoutSessionRequired: app.backchannel_logout_session_required ?? false,
          softwareId: app.software_id,
          softwareVersion: app.software_version,
          dpopBoundAccessTokens: app.dpop_bound_access_tokens ?? false
        }
      }),
      appData: app,
      oauthConfiguration: {
        issuer: String(metadata.issuer),
        discoveryUrl: `${auth.options.baseURL}/.well-known/openid-configuration`,
        authorizationEndpoint: String(metadata.authorization_endpoint),
        tokenEndpoint: String(metadata.token_endpoint),
        userInfoEndpoint: String(metadata.userinfo_endpoint),
        jwksUri: String(metadata.jwks_uri),
        endSessionEndpoint: metadata.end_session_endpoint ? String(metadata.end_session_endpoint) : undefined
      },
      deleteAppForm: await superValidate(zod(deleteAppSchema), {
        defaults: {
          id: app.client_id
        }
      })
    };
  } catch (err) {
    if (isHttpError(err)) throw err;
    console.error("Error during app editing:", err);
    error(500, "Something went wrong trying to edit your app");
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  editApp: async (event) => {
    const { request, locals } = event;
    if (!locals.user) error(401, "Unauthorized");
    const form = await superValidate(event, zod(appSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      if (form.data.id !== event.params.id) {
        return fail(400, {
          form,
          error: "App ID is required for editing"
        });
      }

      const storedApp = await db.query.oauthClient.findFirst({
        where: (client, { and, eq }) => and(eq(client.clientId, form.data.id), eq(client.userId, locals.user!.id)),
        columns: { tokenEndpointAuthMethod: true, jwks: true, jwksUri: true }
      });
      if (!storedApp) return fail(404, { form, error: "App not found" });

      if (
        form.data.tokenEndpointAuthMethod !== (storedApp.tokenEndpointAuthMethod ?? "client_secret_basic") ||
        JSON.stringify(JSON.parse(form.data.jwks.trim() || "null")) !==
          JSON.stringify(JSON.parse(storedApp.jwks || "null")) ||
        (form.data.jwksUri || "") !== (storedApp.jwksUri || "")
      ) {
        return fail(400, {
          form,
          error:
            "Authentication method and signing keys cannot be changed after registration. Create a new app for a different method or key set."
        });
      }

      await auth.api.adminUpdateOAuthClient({
        headers: request.headers,
        body: { client_id: form.data.id, update: clientMetadata(form.data) }
      });

      // The provider update schema cannot clear optional URI lists. Clear those fields
      // explicitly, and merge our description without overwriting admin-owned labels.
      await db
        .update(oauthClient)
        .set({
          uri: form.data.uri || null,
          tos: form.data.tosUri || null,
          policy: form.data.policyUri || null,
          icon: form.data.logoUrl || null,
          softwareId: form.data.softwareId || null,
          softwareVersion: form.data.softwareVersion || null,
          postLogoutRedirectUris: form.data.postLogoutRedirectUris,
          backchannelLogoutUri: form.data.backchannelLogoutUri || null,
          metadata: sql`coalesce(${oauthClient.metadata}, '{}'::jsonb) || ${JSON.stringify({ description: form.data.description })}::jsonb`,
          updatedAt: new Date()
        })
        .where(and(eq(oauthClient.clientId, form.data.id), eq(oauthClient.userId, locals.user.id)));

      return {
        form
      };
    } catch (err) {
      if (err instanceof APIError && err.statusCode >= 400 && err.statusCode < 500) {
        return fail(err.statusCode, {
          form,
          error: err.body?.error_description ?? err.body?.message ?? "Invalid OAuth client configuration"
        });
      }
      console.error("Error during app editing:", err);
      return fail(500, {
        form,
        error: "Something went horribly wrong trying to edit your app"
      });
    }
  },
  deleteApp: async (event) => {
    const { request, locals } = event;
    if (!locals.user) error(401, "Unauthorized");
    const form = await superValidate(event, zod(deleteAppSchema));

    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      if (form.data.id !== event.params.id) return fail(400, { form, error: "App ID does not match this page" });
      await auth.api.deleteOAuthClient({
        body: {
          client_id: form.data.id // required
        },
        // This endpoint requires session cookies.
        headers: request.headers
      });
    } catch (err) {
      console.error("Error during app deletion:", err);
      return fail(500, {
        form,
        error: "Internal server error during app deletion"
      });
    }

    redirect(303, "/dashboard/developer/apps");
  }
};
