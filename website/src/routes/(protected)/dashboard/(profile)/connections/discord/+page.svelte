<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { authClient } from "$lib/auth-client";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Empty from "$ui/empty";
  import { CopyButton } from "$ui/extras/copy-button";
  import MessageCircleOffIcon from "@lucide/svelte/icons/message-circle-off";
  import UserRound from "@lucide/svelte/icons/user-round";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const account = $derived(data.discordAccount);
</script>

{#if account}
  <div class="relative isolate flex w-full flex-col overflow-clip rounded-lg border-2 bg-card">
    <div class="relative">
      <Avatar.Root class="relative z-20 aspect-video size-full max-h-64 overflow-clip rounded-none">
        <Avatar.Image class="pointer-events-none size-full object-cover select-none" src="https://cdn.discordapp.com/banners/{account.user.id}/{account.data?.banner}.webp?size=1024&animated=true" alt="{account.user?.name}'s Banner" />
        <Avatar.Fallback class="size-full rounded-none bg-muted/20">
          {#snippet child({ props })}
            <div {...props}></div>
          {/snippet}
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root class="pointer-events-none absolute bottom-0 left-4 z-30 size-44 translate-y-16 overflow-hidden rounded-full bg-card p-2 select-none">
        <Avatar.Image loading="lazy" class="rounded-full" src={account.data?.image_url} alt="User's Discord Avatar" />
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
          <p class="text-sm text-muted-foreground">{account.user.id}</p>
          <CopyButton text={account.user.id.toString()} variant="ghost" size="sm" class="-my-2 text-muted-foreground hover:text-foreground" />
        </div>
        <Button
          class="mt-4"
          variant="destructive"
          onclick={() =>
            toast.promise(
              authClient.unlinkAccount({
                providerId: "discord"
              }),
              {
                loading: "Unlinking Discord account...",
                success: "Discord account unlinked",
                error: "Failed to unlink Discord account",
                finally: () => {
                  invalidateAll();
                }
              }
            )}>
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
      <Empty.Description>You haven't linked a Discord account yet. Get started by linking your Discord account.</Empty.Description>
    </Empty.Header>
    <Empty.Content>
      <div class="flex gap-2">
        <Button
          onclick={async () =>
            await authClient.linkSocial({
              provider: "discord",
              callbackURL: location.href
            })}>
          Link Discord Account
        </Button>
      </div>
    </Empty.Content>
  </Empty.Root>
{/if}
