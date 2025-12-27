import type { oauthClient } from "$lib/server/db/schema";

export type SelectOauthClient = typeof oauthClient.$inferSelect;
export type SelectOauthClientWithoutSecret = Omit<SelectOauthClient, "clientSecret">;

export enum AppFormVariant {
  CREATE = "create",
  EDIT = "edit"
}
