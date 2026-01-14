<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import * as Alert from "$lib/components/ui/alert";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import type { OAuthClient } from "@better-auth/oauth-provider";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import AlertCircle from "@lucide/svelte/icons/alert-circle";
  import type { PageProps } from "./$types";
  import AppForm from "./app-form.svelte";
  import { AppFormVariant } from "./types.d";

  const { data }: PageProps = $props();
  const { appsData: apps } = $derived(data);

  const session = authClient.useSession();
  const emailVerified = $derived($session.data?.user?.emailVerified ?? false);
</script>

<div class="@container mx-auto flex max-w-xl flex-col justify-start gap-8 self-center px-2 py-6 md:px-0">
  {#if !emailVerified}
    <Alert.Root>
      <AlertCircle class="h-4 w-4" />
      <Alert.Title>Email Verification Required</Alert.Title>
      <Alert.Description>You must verify your email address before you can create OAuth applications. Please check your inbox for a verification email.</Alert.Description>
    </Alert.Root>
  {/if}
  <Card.Root class="w-full bg-background data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[disabled=true]:select-none" data-disabled={!emailVerified}>
    <Card.Header>
      <Card.Title>Apps</Card.Title>
      <Card.Description>Manage your apps</Card.Description>
    </Card.Header>

    <Card.Content>
      <AppForm variant={AppFormVariant.CREATE} {data} />
    </Card.Content>
    <div class="grid grid-cols-1 gap-4 px-6 py-6 @lg:grid-cols-2">
      {#each apps as app (app.id)}
        {@render appCard(app)}
      {/each}
    </div>
  </Card.Root>
</div>

{#snippet appCard(app: OAuthClient)}
  {@const avatar = createAvatar(botttsNeutral, {
    size: 128,
    seed: app.client_id
  })}
  <Button href="apps/{app.client_id}" class="contents cursor-pointer">
    <Card.Root class="gap-0 space-y-2 truncate p-0 pb-2">
      {#if app.logo_uri}
        <Avatar.Root class="pointer-events-none size-40 w-full rounded-none select-none">
          <Avatar.Image src={app.logo_uri} alt="App Logo" class="size-full object-contain" />
          <Avatar.Fallback>{app.client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
      {:else}
        <div class="bg-(--bgColor,transparent)" style="--bgColor: {avatar.toJson().extra.primaryBackgroundColor}">
          <Avatar.Root class="pointer-events-none mx-auto flex size-40 shrink-0 justify-center rounded-none select-none">
            <Avatar.Image src={avatar.toDataUri()} alt="App Avatar" class="size-full" />
            <Avatar.Fallback>{app.client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
        </div>
      {/if}
      <Card.Header class="my-0 items-center justify-center px-6 py-0 text-center">
        <Card.Title class="text-lg">{app.name}</Card.Title>
      </Card.Header>

      <Card.Description class="w-full truncate px-6 text-center">
        {app.description || "No description provided."}
      </Card.Description>
    </Card.Root>
  </Button>
{/snippet}
