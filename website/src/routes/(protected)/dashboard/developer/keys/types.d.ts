import { auth } from "$lib/server/auth";

// Infer the API key type from better-auth's listApiKeys result
export type ApiKey = Awaited<ReturnType<typeof auth.api.listApiKeys>>[number] & {
  // Optional fields that might be present in certain contexts (e.g., newly created keys)
  key?: string;
};
