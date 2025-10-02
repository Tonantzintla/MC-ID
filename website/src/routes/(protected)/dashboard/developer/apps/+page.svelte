<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import * as Alert from "$lib/components/ui/alert";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import { tz } from "@date-fns/tz";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import AlertCircle from "@lucide/svelte/icons/alert-circle";
  import { formatDistanceStrict } from "date-fns";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import AppForm from "./app-form.svelte";
  import { AppFormVariant, type SelectOauthApplicationWithoutSecret } from "./types.d";

  const { data }: PageProps = $props();
  const { appsData: apps } = data;

  const session = authClient.useSession();
  const emailVerified = $derived($session.data?.user?.emailVerified ?? false);

  let currentTime = $state(new Date());

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  });
</script>

<div class="@container mx-auto flex max-w-xl flex-col justify-start gap-8 self-center px-2 py-6 md:px-0">
  {#if !emailVerified}
    <Alert.Root>
      <AlertCircle class="h-4 w-4" />
      <Alert.Title>Email Verification Required</Alert.Title>
      <Alert.Description>You must verify your email address before you can create OAuth applications. Please check your inbox for a verification email.</Alert.Description>
    </Alert.Root>
  {/if}
  <Card.Root class="bg-background w-full data-[disabled=true]:pointer-events-none data-[disabled=true]:select-none data-[disabled=true]:opacity-50" data-disabled={!emailVerified}>
    <Card.Header>
      <Card.Title>Apps</Card.Title>
      <Card.Description>Manage your apps</Card.Description>
    </Card.Header>

    <Card.Content>
      <AppForm variant={AppFormVariant.CREATE} {data} />
    </Card.Content>
    <div class="@lg:grid-cols-2 grid grid-cols-1 gap-4 px-6 py-6">
      {#each apps as app (app.id)}
        {@render appCard(app)}
      {/each}
    </div>
  </Card.Root>
</div>

{#snippet appCard(app: SelectOauthApplicationWithoutSecret)}
  {@const avatar = createAvatar(botttsNeutral, {
    size: 128,
    seed: app.id ?? "default-avatar"
  })}
  {@const metadata = app.metadata ? JSON.parse(app.metadata) : {}}
  <Button href="apps/{app.clientId}" class="contents cursor-pointer">
    <Card.Root class="gap-0 space-y-2 truncate p-0 pb-2">
      <div class="bg-(--bgColor,transparent)" style="--bgColor: {avatar.toJson().extra.primaryBackgroundColor}">
        <Avatar.Root class="pointer-events-none mx-auto flex size-40 flex-shrink-0 select-none justify-center rounded-none">
          <Avatar.Image src={avatar.toDataUri()} alt="App Avatar" class="size-full" />
          <Avatar.Fallback>{app.name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <Card.Header class="my-0 items-center justify-center px-6 py-0 text-center">
        <Card.Title class="text-lg">{app.name}</Card.Title>
      </Card.Header>

      <Card.Description class="w-full truncate px-6 text-center">
        {metadata?.description || "No description provided."}
      </Card.Description>

      {#if app.createdAt && app.updatedAt}
        <Card.Footer>
          {@const isSameTime = new Date(app.createdAt).getTime() === new Date(app.updatedAt).getTime()}
          <Card.Description class="mx-auto text-xs">{isSameTime ? "Created" : "Updated"} {formatDistanceStrict(isSameTime ? app.createdAt : app.updatedAt, currentTime, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}</Card.Description>
        </Card.Footer>
      {/if}
    </Card.Root>
  </Button>
{/snippet}
