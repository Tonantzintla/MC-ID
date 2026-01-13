import { getRequestEvent, query } from "$app/server";
import { auth } from "$lib/server/auth";
import { error } from "@sveltejs/kit";
import { z } from "zod/v4-mini";

export const resetSecret = query(z.string(), async (client_id) => {
  const { locals, request } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");
  try {
    const result = await auth.api.rotateClientSecret({
      body: {
        client_id
      },
      headers: request.headers,
      request // Pass the full request object for ctx.request
    });

    return {
      success: true,
      secret: result.client_secret
    };
  } catch (err) {
    console.error("Error during secret reset:", err);
    error(500, "Something went wrong trying to reset your app secret");
  }
});
