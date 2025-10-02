import { auth } from "$lib/server/auth";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { accountDeletionSchema, profileUpdateSchema } from "./schema";

export const load = (async ({ locals }) => {
  return {
    profileUpdateForm: await superValidate(
      zod(profileUpdateSchema, {
        defaults: {
          email: locals.user?.email ?? "",
          name: locals.user?.name || undefined
        }
      })
    ),
    accountDeletionForm: await superValidate(zod(accountDeletionSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  updateEmail: async ({ request, locals }) => {
    const form = await superValidate(request, zod(profileUpdateSchema));
    if (!form.valid) {
      return { form };
    }

    const { email } = form.data;

    try {
      auth.api.changeEmail({ body: { newEmail: email }, headers: request.headers });
      if (locals.user) {
        locals.user.email = email;
        locals.user.emailVerified = false; // Email needs to be re-verified
      }
      return { form, success: true };
    } catch (err) {
      console.error("Error updating email:", err);
      return fail(500, {
        form,
        error: "Failed to update your email. Please try again later."
      });
    }
  },
  deleteAccount: async ({ request, locals }) => {
    const form = await superValidate(request, zod(accountDeletionSchema));
    if (!form.valid) {
      return { form };
    }

    if (form.data.confirm !== "DELETE") {
      return fail(400, {
        form,
        error: "You must type 'DELETE' to confirm account deletion."
      });
    }

    try {
      const _data = await auth.api.deleteUser({
        body: { password: form.data["current-password"] },
        headers: request.headers
      });
      if (locals.user) locals.user = undefined;
      if (locals.session) locals.session = undefined;
      redirect(303, "/");
    } catch (err) {
      console.error("Error deleting account:", err);
      return fail(500, {
        form,
        error: "Failed to delete your account. Please try again later."
      });
    }
  }
};
