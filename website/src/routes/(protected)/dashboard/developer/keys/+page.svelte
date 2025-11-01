<script lang="ts">
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import * as Avatar from "$ui/avatar";
  import * as Card from "$ui/card";
  import * as Password from "$ui/extras/password";
  import { tz } from "@date-fns/tz";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import AlertCircle from "@lucide/svelte/icons/alert-circle";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import { formatDistanceStrict } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";
  import { deleteApiKey, getApiKeys } from "./apiKeys.remote";
  import KeyForm from "./key-form.svelte";
  import { type ApiKey } from "./types";

  const { data }: PageProps = $props();

  const session = authClient.useSession();
  const emailVerified = $derived($session.data?.user?.emailVerified ?? false);

  const allApiKeys = getApiKeys();
  let currentTime = $state(new Date());
  let changingApiKeys = $state<boolean>(false);

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
      <Alert.Description>You must verify your email address before you can create API keys. Please check your inbox for a verification email.</Alert.Description>
    </Alert.Root>
  {/if}
  <Alert.Root>
    <AlertCircle class="h-4 w-4" />
    <Alert.Title>Heads up!</Alert.Title>
    <Alert.Description class="mb-2">API keys are for when you want to access our API directly, aka Headless mode.</Alert.Description>
    <Alert.Description>Headless mode is not recommended for most users. <br /> Check our documentation for the differences between Headless and our standard mode.</Alert.Description>
  </Alert.Root>
  <Card.Root class="w-full bg-background data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[disabled=true]:select-none" data-disabled={!emailVerified}>
    <Card.Header>
      <Card.Title>API Keys</Card.Title>
      <Card.Description>Manage your API Keys</Card.Description>
    </Card.Header>

    <Card.Content>
      <KeyForm {data} />
    </Card.Content>

    <svelte:boundary>
      {#if allApiKeys.loading}
        <div class="flex w-full items-center justify-center py-10">
          <Spinner />
        </div>
      {/if}
      {#if allApiKeys.error}
        <div class="text-destructive">Failed to load your API keys. Please try again later.</div>
      {/if}
      {#if (allApiKeys.current?.length !== 0 || page.form?.createdKey) && !allApiKeys.loading}
        <div class="grid grid-cols-1 gap-4 px-6 py-6">
          {#if page.form?.createdKey}
            {@render keyCard(page.form.createdKey)}
          {/if}
          {#each allApiKeys.current?.filter((apiKey) => !page.form?.createdKey || apiKey.id !== page.form.createdKey.id) as apiKey (apiKey.id)}
            {@render keyCard(apiKey)}
          {/each}
        </div>
      {/if}
    </svelte:boundary>
  </Card.Root>
</div>

{#snippet keyCard(apiKey: ApiKey & { key?: string; permissions?: { [key: string]: string[] } | null })}
  {@const avatar = createAvatar(botttsNeutral, {
    size: 128,
    seed: apiKey.id ?? "default-avatar"
  })}
  <Card.Root class="relative gap-0 space-y-2 truncate p-0 pb-2">
    <Button
      type="button"
      variant="secondary"
      size="sm"
      class="group absolute top-2 right-2 aspect-square h-auto"
      disabled={changingApiKeys}
      onclick={() => {
        if (!apiKey.id) {
          toast.error("API key ID is missing");
          return;
        }
        changingApiKeys = true;
        toast.promise(
          new Promise((resolve, reject) => {
            deleteApiKey(apiKey.id!)
              .then(resolve)
              .catch(reject)
              .finally(async () => {
                await getApiKeys().refresh();
                changingApiKeys = false;
              });
          }),
          {
            loading: "Deleting key...",
            success: "Key deleted successfully!",
            error: "Failed to delete Key"
          }
        );
      }}
      aria-label="Delete API Key">
      <Trash2 class="opacity-50 transition-opacity duration-300 group-hover:opacity-100 hover:text-destructive" />
    </Button>
    <div class="bg-(--bgColor,transparent)" style="--bgColor: {avatar.toJson().extra.primaryBackgroundColor}">
      <Avatar.Root class="pointer-events-none mx-auto flex size-40 flex-shrink-0 justify-center rounded-none select-none">
        <Avatar.Image src={avatar.toDataUri()} alt="App Avatar" class="size-full" />
        <Avatar.Fallback>{apiKey.name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
    </div>
    <Card.Header class="my-0 items-center justify-center px-6 py-0 text-center">
      <Card.Title class="text-lg">{apiKey.name}</Card.Title>
    </Card.Header>

    {#if apiKey.key}
      <Card.Content class="space-y-2 px-6">
        <Alert.Root class="mt-2">
          <AlertCircle class="h-4 w-4" />
          <Alert.Title>Important!</Alert.Title>
          <Alert.Description>This is the only time you will see your API key. Make sure to copy it now and store it securely.</Alert.Description>
        </Alert.Root>

        <Password.Root class="w-full">
          <Password.Input value={apiKey.key} readonly autocomplete="off" id="secret">
            <Password.Copy />
            <Password.ToggleVisibility />
          </Password.Input>
        </Password.Root>
      </Card.Content>
    {/if}

    <Card.Footer>
      {#if apiKey.createdAt && apiKey.updatedAt}
        {@const isSameTime = new Date(apiKey.createdAt).getTime() === new Date(apiKey.updatedAt).getTime()}
        <Card.Description class="mx-auto text-xs">{isSameTime ? "Created" : "Updated"} {formatDistanceStrict(isSameTime ? apiKey.createdAt : apiKey.updatedAt, currentTime, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}</Card.Description>
      {/if}
    </Card.Footer>
  </Card.Root>
{/snippet}
