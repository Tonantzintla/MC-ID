import { defaultPermissions } from "$api/utils";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import type { Actions } from "@sveltejs/kit";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { keySchema } from "./schema";

export const load = (async (event) => {
  const { locals, request } = event;
  const { headers } = request;

  if (!locals.user) redirect(303, "/login");

  try {
    const keys = await auth.api.listApiKeys({
      // This endpoint requires session cookies.
      headers
    });

    return {
      keyForm: await superValidate(zod(keySchema)),
      keysData: keys
    };
  } catch (err) {
    console.error("Unexpected error during keys data fetch:", err);
    error(500, "Something went wrong trying to fetch your keys");
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  createKey: async (event) => {
    const { locals } = event;
    const form = await superValidate(event, zod(keySchema));

    try {
      if (!form.valid) {
        return fail(400, {
          form
        });
      }

      const email = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, locals.user?.id ?? ""),
        columns: { emailVerified: true }
      });

      // Check if user's email is verified
      if (!email?.emailVerified) {
        return fail(403, {
          form,
          error: "You must verify your email address before creating an API key"
        });
      }

      const createdKey = await auth.api.createApiKey({
        body: {
          userId: locals.user!.id,
          name: form.data.name,
          rateLimitEnabled: true,
          // Default to 300 requests per 5 minutes
          // The duration in milliseconds where each request is counted. Once the maxRequests is reached, the request will be rejected until the timeWindow has passed, at which point the timeWindow will be reset. server-only.
          rateLimitTimeWindow:
            1000 * // 1 second,
            60 * // 1 minute,
            5, // 5 minutes
          // Maximum amount of requests allowed within a window. Once the maxRequests is reached, the request will be rejected until the timeWindow has passed, at which point the timeWindow will be reset. server-only.
          rateLimitMax: 300,
          permissions: defaultPermissions
        }
      });

      return { form, success: "Successfully created API key", createdKey };
    } catch (err) {
      console.error("Error during key creation:", err);
      return fail(500, {
        form,
        error: "Internal server error during key creation"
      });
    }
  }
};
