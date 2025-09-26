<script lang="ts">
  import UserRound from "@lucide/svelte/icons/user-round";
  import type { OAuth2UserInfo } from "better-auth";

  type ValidSizes = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

  interface props {
    account: {
      user: OAuth2UserInfo;
      data: Record<string, any>;
    };
    size?: ValidSizes;
    class?: string;
  }

  let { class: className = "size-12", size = 128, account }: props = $props();

  let errored = $state(false);
</script>

{#if !account.data.image_url || errored}
  <div class="{className} flex items-center justify-center rounded-full bg-black bg-blend-darken select-none">
    <UserRound />
  </div>
{:else}
  <img loading="lazy" class="{className} rounded-full" src={account.data.image} alt="User Icon" onerror={() => (errored = true)} />
{/if}
