import { auth } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load = (async ({ request }) => {
  const accounts = await auth.api.listUserAccounts({
    headers: request.headers
  });

  const discord = accounts?.find((account) => account.providerId === "discord");

  let discordInfo;
  if (discord) {
    discordInfo = await auth.api.accountInfo({
      query: { accountId: discord?.accountId },
      headers: request.headers
    });
  }
  return {
    discordAccount: discordInfo
  };
}) satisfies PageServerLoad;
