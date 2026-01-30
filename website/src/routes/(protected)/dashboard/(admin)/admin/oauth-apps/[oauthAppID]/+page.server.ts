import { db } from "$lib/server/db";
import { oauthClient, oauthClientReport } from "$lib/shared/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { deleteOauthAppSchema, handleReportSchema, updateOauthAppSchema } from "./schema";

export const load = (async ({ params }) => {
  const { oauthAppID } = params;
  const oauthApp = await db.query.oauthClient.findFirst({
    where: (key, { eq }) => eq(key.id, oauthAppID),
    columns: { clientSecret: false, userId: false },
    with: {
      oauthClientReports: {
        with: {
          reporter: {
            with: {
              minecraftAccounts: {
                where: (ma, { eq }) => eq(ma.primary, true),
                limit: 1
              }
            }
          },
          resolvedBy: {
            with: {
              minecraftAccounts: {
                where: (ma, { eq }) => eq(ma.primary, true),
                limit: 1
              }
            }
          }
        }
      },
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

  if (!oauthApp) {
    error(404, "OAuth app not found");
  }

  const { user, ...rest } = oauthApp;
  const oauthAppWithMinecraftAccount = {
    ...rest,
    minecraftAccount: user?.minecraftAccounts[0] ?? null
  };

  const [updateOauthAppForm, deleteOauthAppForm, handleReportForm] = await Promise.all([
    superValidate(zod(updateOauthAppSchema), {
      defaults: {
        oauthAppID: oauthApp.id,
        disabled: oauthApp.disabled
      }
    }),
    superValidate(zod(deleteOauthAppSchema), {
      defaults: {
        oauthAppID: oauthApp.id
      }
    }),
    superValidate(zod(handleReportSchema))
  ]);
  return {
    oauthApp: oauthAppWithMinecraftAccount,
    updateOauthAppForm,
    deleteOauthAppForm,
    handleReportForm
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  updateOauthApp: async (event) => {
    const form = await superValidate(event, zod(updateOauthAppSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const data = await db
        .update(oauthClient)
        .set({
          disabled: form.data.disabled ?? false
        })
        .where(eq(oauthClient.id, form.data.oauthAppID))
        .returning();

      if (!data) {
        console.error("Update OAuth app failed: Invalid data");
        return fail(400, {
          form,
          error: "Invalid data"
        });
      }
    } catch (err) {
      console.error("Exception while trying to update OAuth app:", err);
      if (err instanceof Error) {
        console.error("Error while trying to update OAuth app:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error trying to update OAuth app"
        });
      } else {
        console.error("Unexpected error while trying to update OAuth app:", err);
        return fail(500, {
          form,
          error: "Internal server error trying to update OAuth app"
        });
      }
    }

    return {
      form
    };
  },
  deleteOauthApp: async (event) => {
    const form = await superValidate(event, zod(deleteOauthAppSchema));

    try {
      await db.delete(oauthClient).where(eq(oauthClient.id, form.data.oauthAppID));
    } catch (err) {
      console.error("Exception while trying to delete OAuth app:", err);
      if (err instanceof Error) {
        console.error("Error while trying to delete OAuth app:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error trying to delete OAuth app"
        });
      } else {
        console.error("Unexpected error while trying to delete OAuth app:", err);
        return fail(500, {
          form,
          error: "Internal server error trying to delete OAuth app"
        });
      }
    }

    redirect(303, "/dashboard/admin/oauth-apps");
  },
  handleReport: async (event) => {
    const { locals } = event;
    const form = await superValidate(event, zod(handleReportSchema));

    if (!form.valid) {
      console.error("Invalid form submission while trying to handle OAuth app report", form);
      return fail(400, {
        form
      });
    }

    if (locals.user?.id === undefined) {
      return fail(403, {
        form,
        error: "You must be logged in to perform this action"
      });
    }

    try {
      const result = await db
        .update(oauthClientReport)
        .set({
          status: form.data.status,
          resolutionNote: form.data.resolutionNote ?? null,
          resolvedAt: new Date(),
          resolvedById: locals.user.id,
          updatedAt: new Date()
        })
        .where(and(eq(oauthClientReport.id, form.data.reportID), eq(oauthClientReport.clientId, form.data.oauthAppID)))
        .returning();

      if (!result || result.length === 0) {
        console.error("Handle OAuth app report failed: Invalid data");
        return fail(400, {
          form,
          error: "Invalid data"
        });
      }
    } catch (err) {
      console.error("Exception while trying to handle OAuth app report:", err);
      if (err instanceof Error) {
        console.error("Error while trying to handle OAuth app report:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error trying to handle OAuth app report"
        });
      } else {
        console.error("Unexpected error while trying to handle OAuth app report:", err);
        return fail(500, {
          form,
          error: "Internal server error trying to handle OAuth app report"
        });
      }
    }

    return {
      form
    };
  }
};
