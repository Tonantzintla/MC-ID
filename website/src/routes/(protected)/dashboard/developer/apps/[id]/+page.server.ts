import { db } from "$lib/server/db";
import { oauthApplication } from "$lib/server/db/schema";
import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { appSchema, deleteAppSchema } from "../schema";
import type { SelectOauthApplicationWithoutSecret } from "../types";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
  const { locals, params } = event;
  if (!locals.user) error(401, "Unauthorized");
  try {
    const app: SelectOauthApplicationWithoutSecret | undefined = await db.query.oauthApplication.findFirst({
      where: (app, { eq, and }) => and(eq(app.clientId, params.id), eq(app.userId, locals.user!.id)),
      columns: {
        clientSecret: false
      }
    });

    if (!app || !app.metadata) error(404, "App not found");

    const appMetadata = JSON.parse(app.metadata);

    return {
      appForm: await superValidate(zod(appSchema), {
        defaults: {
          name: app.name || "",
          uri: appMetadata?.uri,
          description: appMetadata?.description,
          redirectUris: app.redirectURLs ? app.redirectURLs.split(",") : [],
          id: app.clientId || "",
          contacts: appMetadata?.contacts,
          scopes: appMetadata?.scopes,
          tosUri: appMetadata?.tosUri,
          policyUri: appMetadata?.policyUri
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

      await db
        .update(oauthApplication)
        .set({
          name: form.data.name,
          metadata: JSON.stringify({
            uri: form.data.uri,
            description: form.data.description,
            contacts: form.data.contacts,
            scopes: form.data.scopes,
            tosUri: form.data.tosUri,
            policyUri: form.data.policyUri
          }),
          redirectURLs: form.data.redirectUris.join(",")
        })
        .where(and(eq(oauthApplication.clientId, form.data.id || ""), eq(oauthApplication.userId, event.locals.user!.id)));

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

      await db.delete(oauthApplication).where(and(eq(oauthApplication.clientId, form.data.id || ""), eq(oauthApplication.userId, event.locals.user!.id)));
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
