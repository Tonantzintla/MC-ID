import type { oauthApplication } from "$lib/server/db/schema";

export type SelectOauthApplication = typeof oauthApplication.$inferSelect;
export type SelectOauthApplicationWithoutSecret = Omit<SelectOauthApplication, "clientSecret">;

export enum AppFormVariant {
  CREATE = "create",
  EDIT = "edit"
}
