import { auth } from "$lib/server/auth";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { passwordUpdateSchema } from "./schema";

export const load = (async () => {
  return {
    passwordUpdateForm: await superValidate(zod(passwordUpdateSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  updatePassword: async ({ request }) => {
    const form = await superValidate(request, zod(passwordUpdateSchema));
    if (!form.valid) {
      return { form };
    }

    const currentPassword = form.data["current-password"];
    const newPassword = form.data["new-password"];
    const confirmPassword = form.data["confirm-password"];

    if (newPassword !== confirmPassword) {
      return fail(400, {
        form,
        error: "New password and confirmation do not match"
      });
    }

    try {
      auth.api.changePassword({ body: { newPassword, currentPassword, revokeOtherSessions: true }, headers: request.headers });
      return { form, success: true };
    } catch (err) {
      console.error("Error updating password:", err);
      return fail(500, {
        form,
        error: "Failed to update password. Please try again later."
      });
    }
  }
};
