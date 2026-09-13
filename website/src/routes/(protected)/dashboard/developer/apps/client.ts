import type { Infer } from "sveltekit-superforms";
import type { AppSchema } from "./schema";

export function clientMetadata(data: Infer<AppSchema>) {
  return {
    client_name: data.name,
    client_uri: data.uri || undefined,
    redirect_uris: data.redirectUris,
    application_type: data.applicationType,
    grant_types: [...new Set(data.grantTypes)],
    response_types: ["code" as const],
    scope: [...new Set(data.scopes)].join(" "),
    contacts: data.contacts,
    tos_uri: data.tosUri || undefined,
    policy_uri: data.policyUri || undefined,
    logo_uri: data.logoUrl || undefined,
    software_id: data.softwareId || undefined,
    software_version: data.softwareVersion || undefined,
    post_logout_redirect_uris: data.postLogoutRedirectUris.length ? data.postLogoutRedirectUris : undefined,
    backchannel_logout_uri: data.backchannelLogoutUri || undefined,
    backchannel_logout_session_required: data.backchannelLogoutSessionRequired,
    dpop_bound_access_tokens: data.dpopBoundAccessTokens
  };
}
