import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const rawApiKeys = await db.query.apikey.findMany({
    columns: { start: false, key: false, userId: false },
    with: {
      user: {
        columns: {},
        with: {
          minecraftAccounts: {
            where: (ma, { eq }) => eq(ma.primary, true),
            limit: 1
          }
        }
      }
    }
  });

  const apiKeys = rawApiKeys.map(({ user, ...apiKey }) => ({
    ...apiKey,
    minecraftAccount: user.minecraftAccounts[0] ?? null
  }));

  return { apiKeys };
}) satisfies PageServerLoad;

export type ApiKeyType = Awaited<ReturnType<typeof load>>["apiKeys"][number];
