import type { OAuthClient } from "@better-auth/oauth-provider";

/** Application-owned metadata that Better Auth flattens onto OAuth client responses. */
export type MCIDOAuthClient = OAuthClient & {
  description?: string;
  official?: boolean;
  owner_user_id?: string;
  trusted?: boolean;
  verified?: boolean;
};
