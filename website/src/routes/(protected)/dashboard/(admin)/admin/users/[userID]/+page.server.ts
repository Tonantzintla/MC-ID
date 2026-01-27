import { auth } from "$lib/server/auth";
import { error, fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { banFormSchema } from "./schema";

export const load = (async ({ request, params }) => {
  const { userID } = params;
  const users = await auth.api.listUsers({
    headers: request.headers,
    request,
    query: {
      filterField: "id",
      filterValue: userID
    }
  });

  if (users.users.length === 0) {
    error(404, "User not found");
  }

  if (users.users.length > 1) {
    error(500, "Multiple users found with the same ID (this should be impossible)");
  }

  return {
    userDetails: users.users[0],
    banForm: await superValidate(zod(banFormSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  banUser: async (event) => {
    const { request } = event;
    const form = await superValidate(event, zod(banFormSchema));
    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const banExpiresIn = form.data.duration === 0 ? undefined : form.data.duration;

      const data = await auth.api.banUser({
        body: {
          userId: form.data.userID,
          banReason: form.data.reason,
          banExpiresIn
        },
        headers: request.headers
      });

      if (!data) {
        console.error("Ban failed: Invalid data");
        return fail(400, {
          form,
          error: "Invalid data"
        });
      }
    } catch (err) {
      console.error("Exception while trying to ban user:", err);
      if (err instanceof Error) {
        console.error("Error while trying to ban user:", err.message);
        return fail(500, {
          form,
          error: err?.message ?? "Internal server error trying to ban user"
        });
      } else {
        console.error("Unexpected error while trying to ban user:", err);
        return fail(500, {
          form,
          error: "Internal server error trying to ban user"
        });
      }
    }

    return {
      form
    };
  }
};
