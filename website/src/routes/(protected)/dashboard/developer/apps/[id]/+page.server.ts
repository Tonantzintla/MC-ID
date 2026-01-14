import { Scope } from "$lib/scopes";
import { auth } from "$lib/server/auth";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { appSchema, deleteAppSchema } from "../schema";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
  const { locals, params, request } = event;
  if (!locals.user) error(401, "Unauthorized");
  try {
    const app = await auth.api.getOAuthClient({
      query: {
        client_id: params.id // required
      },
      // This endpoint requires session cookies.
      headers: request.headers,
      request
    });

    if (!app) error(404, "App not found");

    return {
      appForm: await superValidate(zod(appSchema), {
        defaults: {
          name: app.client_name || "",
          uri: app.client_uri,
          description: (app.metadata as { description?: string })?.description || "",
          redirectUris: app.redirect_uris ?? [],
          id: app.client_id,
          contacts: app.contacts ?? [],
          tosUri: app.tos_uri,
          policyUri: app.policy_uri,
          scopes: (app.scope?.split(" ") as Scope[]) || [Scope.OPENID, Scope.OFFLINE_ACCESS],
          logoUrl: app.logo_uri
        }
      }),
      appData: app,
      deleteAppForm: await superValidate(zod(deleteAppSchema), {
        defaults: {
          id: app.client_id
        }
      })
    };
  } catch (err) {
    console.error("Error during app editing:", err);
    error(500, "Something went wrong trying to edit your app");
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  editApp: async (event) => {
    const { request } = event;
    const form = await superValidate(event, zod(appSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      // Always include openid and offline_access scopes for OIDC compatibility
      const clientScopes = [Scope.OPENID, ...form.data.scopes, Scope.OFFLINE_ACCESS];

      if (!form.data.id) {
        return fail(400, {
          form,
          error: "App ID is required for editing"
        });
      }

      await auth.api.adminUpdateOAuthClient({
        body: {
          client_id: form.data.id, // required
          update: {
            client_name: form.data.name,
            client_uri: form.data.uri,
            redirect_uris: form.data.redirectUris,
            scope: Array.from(new Set(clientScopes)).join(" "),
            contacts: form.data.contacts,
            tos_uri: form.data.tosUri,
            policy_uri: form.data.policyUri,
            logo_uri: form.data.logoUrl
            // metadata: {
            //   description: form.data.description
            // }
          }
        },
        // This endpoint requires session cookies.
        headers: request.headers,
        request
      });

      return {
        form
      };
    } catch (err) {
      console.error("Error during app editing:", err);
      return fail(500, {
        form,
        error: "Something went horribly wrong trying to edit your app"
      });
    }
  },
  deleteApp: async (event) => {
    const { request } = event;
    const form = await superValidate(event, zod(deleteAppSchema));

    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      await auth.api.deleteOAuthClient({
        body: {
          client_id: form.data.id // required
        },
        // This endpoint requires session cookies.
        headers: request.headers,
        request
      });
    } catch (err) {
      console.error("Error during app deletion:", err);
      return fail(500, {
        form,
        error: "Internal server error during app deletion"
      });
    }

    redirect(307, "/dashboard/developer/apps");
  }
};
