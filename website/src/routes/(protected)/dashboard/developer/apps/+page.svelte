<script lang="ts">
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import { createBotttsNeutralAvatar } from "$lib/avatar";
  import * as Alert from "$lib/components/ui/alert";
  import type { MCIDOAuthClient } from "$lib/types/oauth";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import { CopyButton } from "$ui/extras/copy-button";
  import * as Password from "$ui/extras/password";
  import { Label } from "$ui/label";
  import AlertCircle from "@lucide/svelte/icons/alert-circle";
  import type { PageProps } from "./$types";
  import AppForm from "./app-form.svelte";
  import { AppFormVariant } from "./types.d";

  const { data }: PageProps = $props();
  const { appsData: apps } = $derived(data);
  const createdApp = $derived(page.form?.createdApp);

  const session = authClient.useSession();
  const emailVerified = $derived($session.data?.user?.emailVerified ?? false);
</script>

<div class="@container mx-auto flex max-w-xl flex-col justify-start gap-8 self-center px-2 py-6 md:px-0">
  {#if !emailVerified}
    <Alert.Root>
      <AlertCircle class="h-4 w-4" />
      <Alert.Title>Email Verification Required</Alert.Title>
      <Alert.Description
        >You must verify your email address before you can create OAuth applications. Please check your inbox for a
        verification email.</Alert.Description>
    </Alert.Root>
  {/if}
  <Card.Root
    class="w-full bg-background data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[disabled=true]:select-none"
    data-disabled={!emailVerified}>
    <Card.Header>
      <Card.Title>Apps</Card.Title>
      <Card.Description>Manage your apps</Card.Description>
    </Card.Header>

    <Card.Content>
      {#if createdApp}
        <div class="flex flex-col gap-4" role="status">
          <Alert.Root>
            <Alert.Title>App created</Alert.Title>
            <Alert.Description>
              {#if createdApp.client_secret}
                Copy your secret now and store it securely. It will not be shown again after you leave this page.
              {:else}
                This authentication method does not use a client secret.
              {/if}
            </Alert.Description>
          </Alert.Root>
          <div class="flex flex-col gap-2">
            <Label for="created-client-id">Client ID</Label>
            <CopyButton
              id="created-client-id"
              text={createdApp.client_id}
              variant="outline"
              class="w-full justify-start">
              <span class="truncate">{createdApp.client_id}</span>
            </CopyButton>
          </div>
          {#if createdApp.client_secret}
            <div class="flex flex-col gap-2">
              <Label for="created-client-secret">Client secret</Label>
              <Password.Root>
                <Password.Input id="created-client-secret" value={createdApp.client_secret} readonly autocomplete="off">
                  <Password.Copy />
                  <Password.ToggleVisibility />
                </Password.Input>
              </Password.Root>
            </div>
          {/if}
          <Button href="apps/{createdApp.client_id}">Configure app and view integration details</Button>
        </div>
      {:else}
        <AppForm variant={AppFormVariant.CREATE} {data} />
      {/if}
    </Card.Content>
    <div class="grid grid-cols-1 gap-4 px-6 py-6 @lg:grid-cols-2">
      {#each apps as app (app.client_id)}
        {@render appCard(app)}
      {/each}
    </div>
  </Card.Root>
</div>

{#snippet appCard(app: MCIDOAuthClient)}
  {@const avatar = createBotttsNeutralAvatar(app.client_id)}
  <Button href="apps/{app.client_id}" class="contents cursor-pointer">
    <Card.Root class="gap-2 truncate p-0 pb-2">
      {#if app.logo_uri}
        <Avatar.Root
          class="pointer-events-none size-40 w-full rounded-none select-none after:rounded-none after:border-0">
          <Avatar.Image src={app.logo_uri} alt="App Logo" class="size-full rounded-none object-contain" />
          <Avatar.Fallback class="rounded-none">{app.client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
      {:else}
        <div class="bg-(--bgColor,transparent)" style:--bgColor={avatar.toJSON().options.backgroundColor?.[0]}>
          <Avatar.Root
            class="pointer-events-none mx-auto flex size-40 shrink-0 justify-center rounded-none select-none after:rounded-none after:border-0">
            <Avatar.Image src={avatar.toDataUri()} alt="App Avatar" class="size-full rounded-none" />
            <Avatar.Fallback class="rounded-none">{app.client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
        </div>
      {/if}
      <Card.Header class="my-0 items-center justify-center px-6 py-0 text-center">
        <Card.Title class="text-lg">{app.client_name}</Card.Title>
      </Card.Header>

      <Card.Description class="w-full truncate px-6 text-center">
        {app.description || "No description provided."}
      </Card.Description>
    </Card.Root>
  </Button>
{/snippet}
