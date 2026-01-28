import { db } from "$lib/server/db";
import { apikey } from "$lib/shared/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { deleteKeySchema, updateKeySchema } from "./schema";

export const load = (async ({ params }) => {
  const { apiKeyID } = params;
  const apiKey = await db.query.apikey.findFirst({
    where: (key, { eq }) => eq(key.id, apiKeyID),
    columns: { start: false, key: false, userId: false },
    with: {
      user: {
        columns: {},
        with: {
          minecraftAccounts: {
            where: (ma, { eq }) => eq(ma.primary, true),
            limit: 1
          }
        }
      }
    }
  });

  if (!apiKey) {
    error(404, "API key not found");
  }

  const { user, ...rest } = apiKey;

  const apiKeyWithMinecraftAccount = {
    ...rest,
    minecraftAccount: user.minecraftAccounts[0] ?? null
  };

  return {
    apiKey: apiKeyWithMinecraftAccount,
    updateKeyForm: await superValidate(zod(updateKeySchema), {
      defaults: {
        apiKeyID: apiKey.id,
        enabled: apiKey.enabled,
        rateLimitEnabled: apiKey.rateLimitEnabled,
        rateLimitTimeWindow: apiKey.rateLimitTimeWindow,
        rateLimitMax: apiKey.rateLimitMax
      }
    }),
    deleteKeyForm: await superValidate(zod(deleteKeySchema), {
      defaults: {
        apiKeyID: apiKey.id
      }
    })
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  updateKey: async (event) => {
    const form = await superValidate(event, zod(updateKeySchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const data = await db
        .update(apikey)
        .set({
          enabled: form.data.enabled ?? false,
          rateLimitEnabled: form.data.rateLimitEnabled ?? false,
          rateLimitTimeWindow: form.data.rateLimitTimeWindow ?? null,
          rateLimitMax: form.data.rateLimitMax ?? null
        })
        .where(eq(apikey.id, form.data.apiKeyID))
        .returning();

      if (!data) {
        console.error("Update API key failed: Invalid data");
        return fail(400, {
          form,
          error: "Invalid data"
        });
      }
    } catch (err) {
      console.error("Exception while trying to update API key:", err);
      if (err instanceof Error) {
        console.error("Error while trying to update API key:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error trying to update API key"
        });
      } else {
        console.error("Unexpected error while trying to update API key:", err);
        return fail(500, {
          form,
          error: "Internal server error trying to update API key"
        });
      }
    }

    return {
      form
    };
  },
  deleteKey: async (event) => {
    const form = await superValidate(event, zod(deleteKeySchema));

    try {
      await db.delete(apikey).where(eq(apikey.id, form.data.apiKeyID));
    } catch (err) {
      console.error("Exception while trying to delete API key:", err);
      if (err instanceof Error) {
        console.error("Error while trying to delete API key:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error trying to delete API key"
        });
      } else {
        console.error("Unexpected error while trying to delete API key:", err);
        return fail(500, {
          form,
          error: "Internal server error trying to delete API key"
        });
      }
    }

    redirect(303, "/dashboard/admin/api-keys");
  }
};
