import { auth } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { resetPasswordFormSchema } from "./schema";

export const load = (async () => {
  return {
    resetPasswordForm: await superValidate(zod(resetPasswordFormSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  reset: async (event) => {
    const form = await superValidate(event, zod(resetPasswordFormSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const data = await auth.api.resetPassword({
        body: {
          newPassword: form.data["confirm-password"],
          token: form.data.token
        }
      });

      if (!data) {
        console.error("No data returned during password reset");
        return fail(400, {
          form,
          error: "Failed to reset password"
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error during password reset:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error during password reset"
        });
      } else {
        console.error("Unexpected error during password reset:", err);
        return fail(500, {
          form,
          error: "Internal server error during password reset"
        });
      }
    }

    redirect(303, "/login?reset=success");
  }
};
