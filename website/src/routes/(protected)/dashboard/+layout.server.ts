import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  return {
    user: locals.user,
    session: locals.session,
    primaryMcAccount: locals.primaryMcAccount
  };
}) satisfies LayoutServerLoad;
