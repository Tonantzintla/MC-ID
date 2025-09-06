import { auth } from "$lib/server/auth";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  const response = await auth.api.signOut({
    headers: event.request.headers
  });

  if (!response.success) {
    console.error("Logout failed");
    error(500, "Logout failed");
  }

  redirect(307, "/login");
};
