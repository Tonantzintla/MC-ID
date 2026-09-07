import { auth } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load = (async ({ request }) => {
  const accounts = await auth.api.listUserAccounts({
    headers: request.headers
  });

  const discord = accounts?.find((account) => account.providerId === "discord");

  if (!discord) {
    return { discordAccount: undefined };
  }

  const discordInfo = await auth.api.accountInfo({
    query: { accountId: discord.id },
    headers: request.headers
  });

  return {
    discordAccount: {
      ...discordInfo,
      accountId: discordInfo.account.id,
      data: discordInfo.data as { avatar?: string; banner?: string; username?: string }
    }
  };
}) satisfies PageServerLoad;
