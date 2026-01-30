<script lang="ts">
  import { cn } from "$lib/utils";
  import * as Avatar from "$ui/avatar";
  import type { OAuthClient } from "@better-auth/oauth-provider";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import type { AvatarRootProps } from "bits-ui";

  type Props = {
    client_id: OAuthClient["client_id"];
    client_name?: OAuthClient["client_name"] | null;
    logo_uri?: OAuthClient["logo_uri"] | null;
    class?: string;
  };

  const { client_id, client_name, logo_uri, class: classList }: Props = $props();

  const preMadeAvatar = $derived(
    createAvatar(botttsNeutral, {
      size: 128,
      seed: client_id
    }).toDataUri()
  );

  const avatar = $derived.by(() => {
    if (logo_uri) return `/api/internal/image-proxy?url=${encodeURIComponent(logo_uri)}`;
    return preMadeAvatar;
  });

  let loadingStatus = $state<AvatarRootProps["loadingStatus"]>("loading");
</script>

<Avatar.Root bind:loadingStatus class={cn(classList)}>
  <Avatar.Image src={avatar} alt="App Avatar" class="size-full" />
  <Avatar.Fallback class="rounded-none">
    {#if logo_uri && loadingStatus === "error"}
      <Avatar.Root class={cn(classList)}>
        <Avatar.Image src={preMadeAvatar} alt="App Avatar" class="size-full" />
        <Avatar.Fallback class="rounded-none">{client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
    {:else}
      {client_name?.slice(0, 2).toUpperCase()}
    {/if}
  </Avatar.Fallback>
</Avatar.Root>
