import { Scope } from "$lib/scopes";
import { db } from "$lib/server/db";
import type { User } from "better-auth";
import type { Client } from "better-auth/plugins";

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

const HTTP_BAD_REQUEST = 400;

export async function getAdditionalUserInfo(user: User, scopes: string[], client: Client): Promise<UserInfoResult> {
  // Parse and validate client metadata
  let allowedScopes: string[] = [];

  if (!client.metadata) {
    console.error(`Client ${client.clientId} has no metadata configured`);
    return {
      error: "invalid_client",
      error_description: "Client configuration is missing scope information.",
      status: HTTP_BAD_REQUEST
    };
  }

  try {
    // Check if metadata is already an object or needs to be parsed
    const metadata = typeof client.metadata === "string" ? JSON.parse(client.metadata) : client.metadata;
    allowedScopes = metadata.scopes || [];
  } catch (error) {
    console.error(`Failed to parse metadata for client ${client.clientId}:`, error);
    return {
      error: "invalid_client",
      error_description: "Client configuration is malformed.",
      status: HTTP_BAD_REQUEST
    };
  }

  // Validate requested scopes
  const invalidScopes = scopes.filter((scope) => !allowedScopes.includes(scope));
  if (invalidScopes.length > 0) {
    console.warn(`Scope validation failed for client ${client.clientId}:`, { requested: scopes, allowed: allowedScopes, invalid: invalidScopes });
    return {
      error: "invalid_scope",
      error_description: `The following scopes are not allowed: ${invalidScopes.join(", ")}`,
      status: HTTP_BAD_REQUEST
    };
  }

  const data: UserInfoSuccess = {};
  console.log("Getting additional user info claim for user:", user.id, "scopes:", scopes, "client:", client.clientId);
  if (scopes.includes(Scope.PROFILE)) {
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
  if (scopes.includes(Scope.CONNECTIONS)) {
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
