<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import * as Alert from "$ui/alert";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Empty from "$ui/empty";
  import { CopyButton } from "$ui/extras/copy-button";
  import { Spinner } from "$ui/spinner";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import MessageCircleOffIcon from "@lucide/svelte/icons/message-circle-off";
  import UserRound from "@lucide/svelte/icons/user-round";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const account = $derived(data.discordAccount);
  const callbackError = $derived(page.url.searchParams.get("error"));
  const callbackErrorMessage = $derived.by(() => {
    switch (callbackError) {
      case "access_denied":
        return "Discord authorization was cancelled. You can try linking again.";
      case "account_already_linked_to_different_user":
        return "This Discord account is already linked to another MC-ID account.";
      default:
        return "Discord linking failed. Please try again.";
    }
  });
  let pending = $state(false);

  async function linkDiscord() {
    if (pending) return;
    pending = true;
    try {
      const callbackURL = new URL(resolve("/dashboard/connections/discord"), page.url.origin).href;
      const result = await authClient.linkSocial({
        provider: "discord",
        callbackURL,
        errorCallbackURL: callbackURL
      });
      if (result.error) throw new Error(result.error.message || "Unable to link Discord.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to link Discord.");
    } finally {
      pending = false;
    }
  }

  async function unlinkDiscord() {
    if (pending || !account) return;
    pending = true;
    try {
      const result = await authClient.unlinkAccount({ accountId: account.accountId });
      if (result.error) throw new Error(result.error.message || "Unable to unlink Discord.");
      await invalidateAll();
      toast.success("Discord account unlinked");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to unlink Discord.");
    } finally {
      pending = false;
    }
  }
</script>

{#if callbackError}
  <Alert.Root class="border-destructive">
    <CircleX />
    <Alert.Title>Discord linking unsuccessful</Alert.Title>
    <Alert.Description>{callbackErrorMessage}</Alert.Description>
  </Alert.Root>
{/if}

{#if account}
  <div class="relative isolate flex w-full flex-col overflow-clip rounded-lg border-2 bg-card">
    <div class="relative">
      <Avatar.Root class="relative z-20 aspect-video size-full max-h-64 overflow-clip rounded-none after:border-0">
        <Avatar.Image
          class="pointer-events-none size-full rounded-none object-cover select-none"
          src={account.data?.banner
            ? `https://cdn.discordapp.com/banners/${account.discordId}/${account.data.banner}?size=512&animated=true`
            : undefined}
          alt="{account.user?.name}'s Banner" />
        <Avatar.Fallback class="size-full rounded-none bg-muted/20">
          {#snippet child({ props })}
            <div {...props}></div>
          {/snippet}
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root
        class="pointer-events-none absolute bottom-0 left-4 z-30 size-44 translate-y-16 overflow-hidden rounded-full bg-card p-2 select-none after:border-0">
        <Avatar.Image
          loading="lazy"
          class="rounded-full"
          src={account.data?.avatar
            ? `https://cdn.discordapp.com/avatars/${account.discordId}/${account.data.avatar}?size=256&animated=true`
            : (account.user.image ?? undefined)}
          alt="User's Discord Avatar" />
        <Avatar.Fallback class="flex items-center justify-center rounded-full bg-black bg-blend-darken select-none">
          <UserRound />
        </Avatar.Fallback>
      </Avatar.Root>
    </div>
    <div class="relative mt-16 flex flex-row items-center gap-4 p-4">
      <div class="flex flex-col gap-1 break-all">
        <p class="text-2xl font-semibold">{account.user?.name}</p>
        <span class="text-sm">{account.data?.username}</span>
        <div class="flex flex-row items-center gap-1">
          <p class="text-sm text-muted-foreground">{account.discordId}</p>
          <CopyButton
            text={String(account.discordId)}
            variant="ghost"
            size="sm"
            class="-my-2 text-muted-foreground hover:text-foreground" />
        </div>
        <Button class="mt-4" variant="destructive" disabled={pending} onclick={unlinkDiscord}>
          {#if pending}<Spinner data-icon="inline-start" />{/if}
          Unlink Discord Account
        </Button>
      </div>
    </div>
  </div>
{:else}
  <Empty.Root class="border">
    <Empty.Header>
      <Empty.Media variant="icon">
        <MessageCircleOffIcon />
      </Empty.Media>
      <Empty.Title>No Discord Account Linked</Empty.Title>
      <Empty.Description
        >You haven't linked a Discord account yet. Get started by linking your Discord account.</Empty.Description>
    </Empty.Header>
    <Empty.Content>
      <div class="flex gap-2">
        <Button disabled={pending} onclick={linkDiscord}>
          {#if pending}<Spinner data-icon="inline-start" />{/if}
          Link Discord Account
        </Button>
      </div>
    </Empty.Content>
  </Empty.Root>
{/if}
