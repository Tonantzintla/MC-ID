import { Scope } from "$lib/scopes";
import { db } from "$lib/server/db";
import { oauthClient } from "$lib/server/db/schema";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { appSchema, deleteAppSchema } from "../schema";
import type { SelectOauthClientWithoutSecret } from "../types";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
  const { locals, params } = event;
  if (!locals.user) error(401, "Unauthorized");
  try {
    const app: SelectOauthClientWithoutSecret | undefined = await db.query.oauthClient.findFirst({
      where: (app, { eq, and }) => and(eq(app.clientId, params.id), eq(app.userId, locals.user!.id)),
      columns: {
        clientSecret: false
      }
    });

    if (!app) error(404, "App not found");

    const appMetadata = (app.metadata ?? {}) as Record<string, unknown>;

    return {
      appForm: await superValidate(zod(appSchema), {
        defaults: {
          name: app.name || "",
          uri: app.uri || "",
          description: (appMetadata?.description as string) || "",
          redirectUris: app.redirectUris ?? [],
          id: app.clientId || "",
          contacts: app.contacts ?? [],
          scopes: (app.scopes ?? []) as Scope[],
          tosUri: app.tos || "",
          policyUri: app.policy || ""
        }
      }),
      appData: app,
      deleteAppForm: await superValidate(zod(deleteAppSchema), {
        defaults: {
          id: app.clientId || ""
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
    const form = await superValidate(event, zod(appSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      // Always include openid and offline_access scopes for OIDC compatibility
      const clientScopes = ["openid", ...form.data.scopes, "offline_access"];
      await db
        .update(oauthClient)
        .set({
          name: form.data.name,
          uri: form.data.uri,
          redirectUris: form.data.redirectUris,
          contacts: form.data.contacts,
          scopes: clientScopes,
          tos: form.data.tosUri,
          policy: form.data.policyUri,
          metadata: {
            description: form.data.description
          }
        })
        .where(and(eq(oauthClient.clientId, form.data.id || ""), eq(oauthClient.userId, event.locals.user!.id)));

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
    const form = await superValidate(event, zod(deleteAppSchema));

    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      await db.delete(oauthClient).where(and(eq(oauthClient.clientId, form.data.id || ""), eq(oauthClient.userId, event.locals.user!.id)));
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
