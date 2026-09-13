<script lang="ts">
  import * as Card from "$ui/card";
  import { CopyButton } from "$ui/extras/copy-button";
  import AppForm from "../app-form.svelte";
  import { AppFormVariant } from "../types.d";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const configuration = $derived(data.oauthConfiguration);
  const endpoints = $derived([
    { label: "Issuer", value: configuration.issuer },
    { label: "Discovery URL", value: configuration.discoveryUrl },
    { label: "Authorization endpoint", value: configuration.authorizationEndpoint },
    { label: "Token endpoint", value: configuration.tokenEndpoint },
    { label: "UserInfo endpoint", value: configuration.userInfoEndpoint },
    { label: "Signing keys", value: configuration.jwksUri },
    { label: "Logout endpoint", value: configuration.endSessionEndpoint }
  ]);
  const authMethod = $derived(data.appForm.data.tokenEndpointAuthMethod);
  const usesClientSecret = $derived(authMethod === "client_secret_basic" || authMethod === "client_secret_post");
  const integrationExample = $derived(`genericOAuth({
  config: [{
    providerId: "mc-id",
    clientId: ${JSON.stringify(data.appData.client_id)},
    clientSecret: MC_ID_CLIENT_SECRET,
    discoveryUrl: ${JSON.stringify(configuration.discoveryUrl)},
    scopes: ${JSON.stringify(data.appForm.data.scopes)},
    pkce: true,
    tokenEndpointAuth: { method: ${JSON.stringify(authMethod)} }
  }]
})`);
</script>

<div class="mx-auto flex w-full max-w-xl flex-col justify-start gap-8 self-center px-2 md:px-0">
  <Card.Root>
    <Card.Header>
      <Card.Title>Edit app</Card.Title>
      <Card.Description>Manage your app's details and OAuth configuration.</Card.Description>
    </Card.Header>
    <Card.Content>
      {#key data.appData.client_id}
        <AppForm variant={AppFormVariant.EDIT} {data} />
      {/key}
    </Card.Content>
  </Card.Root>
  <Card.Root>
    <Card.Header>
      <Card.Title>Connect to MC-ID</Card.Title>
      <Card.Description
        >Use discovery to configure your OAuth library. Your registered authentication method is {authMethod}.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <dl class="flex flex-col gap-3">
        {#each endpoints as endpoint (endpoint.label)}
          {#if endpoint.value}
            <div class="flex flex-col gap-1">
              <dt class="text-sm text-muted-foreground">{endpoint.label}</dt>
              <dd class="min-w-0">
                <CopyButton text={endpoint.value} variant="outline" class="w-full justify-start">
                  <span class="truncate">{endpoint.value}</span>
                </CopyButton>
              </dd>
            </div>
          {/if}
        {/each}
      </dl>
      {#if data.appForm.data.dpopBoundAccessTokens}
        <p class="text-sm text-muted-foreground">
          This app requires DPoP. Your OAuth client must generate and send DPoP proofs; the basic configuration below
          does not implement them.
        </p>
      {/if}
      {#if usesClientSecret}
        <p class="text-sm text-muted-foreground">
          For Better Auth's genericOAuth plugin, set tokenEndpointAuth explicitly. Keep MC_ID_CLIENT_SECRET in your
          server environment.
        </p>
        <pre class="overflow-x-auto rounded-md bg-muted p-4 text-sm"><code>{integrationExample}</code></pre>
        <CopyButton text={integrationExample} variant="outline">Copy Better Auth configuration</CopyButton>
      {:else if authMethod === "private_key_jwt"}
        <p class="text-sm text-muted-foreground">
          Configure a client that supports private_key_jwt to sign client assertions with the private key matching your
          registered public JWKS. No shared client secret is issued.
        </p>
      {:else}
        <p class="text-sm text-muted-foreground">
          Configure your client with token endpoint authentication set to none and PKCE S256. Public clients must not
          embed a client secret.
        </p>
      {/if}
      <p class="text-sm text-muted-foreground">
        Request only the scopes your app needs. Refresh tokens require both the refresh_token grant and offline_access
        in the authorization request.
      </p>
    </Card.Content>
  </Card.Root>
</div>
