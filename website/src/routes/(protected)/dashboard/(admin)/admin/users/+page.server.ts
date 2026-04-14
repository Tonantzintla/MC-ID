import { auth } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load = (async ({ request }) => {
  const users = await auth.api.listUsers({
    headers: request.headers,
    query: {}
  });
  return {
    users: users.users
  };
}) satisfies PageServerLoad;
