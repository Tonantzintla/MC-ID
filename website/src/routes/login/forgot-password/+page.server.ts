import { auth } from "$lib/server/auth";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { forgotPasswordSchema } from "./schema";

export const load = (async () => {
  return {
    forgotPasswordForm: await superValidate(zod(forgotPasswordSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  request: async (event) => {
    const form = await superValidate(event, zod(forgotPasswordSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const data = await auth.api.requestPasswordReset({
        body: {
          email: form.data.email, // required
          redirectTo: "/login/reset-password"
        }
      });

      if (!data) {
        console.error("Request password reset link failed: Invalid credentials");
        return fail(400, {
          form,
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error during request password reset link:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error during request password reset link "
        });
      } else {
        console.error("Unexpected error during request password reset link:", err);
        return fail(500, {
          form,
          error: "Internal server error during request password reset link"
        });
      }
    }

    return {
      form,
      success: "If an account with that email exists, a password reset link has been sent."
    };
  }
};
