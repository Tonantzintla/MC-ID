import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { clientMetadata } from "./client";
import { appSchema, deleteAppSchema } from "./schema";

export const load = (async (event) => {
  const { locals, request } = event;

  if (!locals.user) redirect(303, "/login");

  try {
    const apps = await auth.api.getOAuthClients({
      headers: request.headers
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
    if (!locals.user) error(401, "Unauthorized");
    event.setHeaders({ "cache-control": "no-store" });
    const form = await superValidate(event, zod(appSchema));

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

      const createdApp = await auth.api.adminCreateOAuthClient({
        headers: request.headers,
        body: {
          ...clientMetadata(form.data),
          token_endpoint_auth_method: form.data.tokenEndpointAuthMethod,
          jwks: form.data.jwks.trim() ? JSON.parse(form.data.jwks) : undefined,
          jwks_uri: form.data.jwksUri || undefined,
          require_pkce: true,
          subject_type: "public",
          skip_consent: false,
          enable_end_session: false,
          metadata: {
            description: form.data.description,
            owner_user_id: locals.user?.id ?? "",
            trusted: false,
            verified: false,
            official: false
          }
        }
      });
      return {
        form,
        createdApp: {
          client_id: createdApp.client_id,
          client_secret: createdApp.client_secret,
          token_endpoint_auth_method: createdApp.token_endpoint_auth_method
        }
      };
    } catch (err) {
      if (err instanceof APIError && err.statusCode >= 400 && err.statusCode < 500) {
        return fail(err.statusCode, {
          form,
          error: err.body?.error_description ?? err.body?.message ?? "Invalid OAuth client configuration"
        });
      }
      console.error("Error during app creation:", err);
      return fail(500, {
        form,
        error: "Internal server error during app creation"
      });
    }
  }
};
