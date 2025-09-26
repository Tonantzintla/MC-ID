<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import { CopyButton } from "$ui/extras/copy-button";
  import UserRound from "@lucide/svelte/icons/user-round";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const account = data.discordAccount;
</script>

{#if account}
  <div class="bg-card relative isolate flex w-full flex-col overflow-clip rounded-lg border-2">
    <div class="relative">
      <Avatar.Root class="relative z-20 aspect-video size-full max-h-64 overflow-clip rounded-none">
        <Avatar.Image class="pointer-events-none size-full select-none object-cover" src="https://cdn.discordapp.com/banners/{account.user.id}/{account.data?.banner}.webp?size=1024&animated=true" alt="{account.user?.name}'s Banner" />
        <Avatar.Fallback class="bg-muted/20 size-full">
          {#snippet child({ props })}
            <div {...props}></div>
          {/snippet}
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root class="bg-card pointer-events-none absolute bottom-0 left-4 z-30 size-44 translate-y-16 select-none overflow-hidden rounded-full p-2">
        <Avatar.Image loading="lazy" class="rounded-full" src={account.data?.image_url} alt="User's Discord Avatar" />
        <Avatar.Fallback class="flex select-none items-center justify-center rounded-full bg-black bg-blend-darken">
          <UserRound />
        </Avatar.Fallback>
      </Avatar.Root>
    </div>
    <div class="relative mt-16 flex flex-row items-center gap-4 p-4">
      <div class="flex flex-col gap-1 break-all">
        <p class="text-2xl font-semibold">{account.user?.name}</p>
        <span class="text-sm">{account.data?.username}</span>
        <div class="flex flex-row items-center gap-1">
          <p class="text-muted-foreground text-sm">{account.user.id}</p>
          <CopyButton text={account.user.id.toString()} variant="ghost" size="sm" class="text-muted-foreground hover:text-foreground -my-2" />
        </div>
        <Button
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
                  // Refresh the page to update the state
                  location.reload();
                }
              }
            )}>
          Unlink Discord Account
        </Button>
      </div>
    </div>
  </div>
{:else}
  <div class="flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed py-20">
    <p class="text-muted-foreground">No Discord account linked</p>
    <Button
      onclick={async () =>
        await authClient.linkSocial({
          provider: "discord",
          callbackURL: location.href
        })}>
      Link Discord Account
    </Button>
  </div>
{/if}
