import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const rawOauthClients = await db.query.oauthClient.findMany({
    columns: { clientSecret: false, userId: false },
    with: {
      oauthClientReports: true,
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

  const oauthClients = rawOauthClients.map(({ user, ...oauthClient }) => ({
    ...oauthClient,
    minecraftAccount: user?.minecraftAccounts[0] ?? null
  }));

  return { oauthClients };
}) satisfies PageServerLoad;

export type OauthClientType = Awaited<ReturnType<typeof load>>["oauthClients"][number];
