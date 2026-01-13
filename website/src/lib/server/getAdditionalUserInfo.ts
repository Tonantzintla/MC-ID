import { Scope } from "$lib/scopes";
import { db } from "$lib/server/db";
import type { User } from "better-auth";

type UserInfoSuccess = {
  accounts?: { uuid: string; username: string; primary: boolean }[];
  connections?: Record<string, unknown>[];
};

type UserInfoError = {
  error: string;
  error_description: string;
  status: number;
};

type UserInfoResult = UserInfoSuccess | UserInfoError;

export async function getAdditionalUserInfo(user: User, requestedScopes: Scope[]): Promise<UserInfoResult> {
  const data: UserInfoSuccess = {};
  console.info("Getting additional user info claim for user:", user.id, "requestedScopes:", requestedScopes);

  if (requestedScopes.includes(Scope.PROFILE)) {
    const mcAccounts = await db.query.minecraftAccount.findMany({
      where: (mc, { eq }) => eq(mc.userId, user.id),
      columns: {
        uuid: true,
        primary: true,
        username: true
      }
    });
    if (mcAccounts.length > 0) {
      data.accounts = mcAccounts;
    } else {
      data.accounts = [];
    }
  }
  if (requestedScopes.includes(Scope.CONNECTIONS)) {
    const connections = await db.query.account.findMany({
      where: (a, { eq, and, not }) => and(eq(a.userId, user.id), not(eq(a.providerId, "credential"))),
      columns: {
        providerId: true,
        accountId: true
      }
    });
    if (connections.length > 0) {
      data.connections = connections;
    } else {
      data.connections = [];
    }
  }
  return data;
}
