<script lang="ts">
  import UserRound from "@lucide/svelte/icons/user-round";
  import type { OAuth2UserInfo } from "better-auth";

  interface props {
    account: {
      user: OAuth2UserInfo;
      data: Record<string, never>;
    };
    class?: string;
  }

  const { class: className = "size-12", account }: props = $props();
  const { data, user: _user } = account;

  let errored = $state(false);
</script>

{#if !data.image_url || errored}
  <div class="{className} flex items-center justify-center rounded-full bg-black bg-blend-darken select-none">
    <UserRound />
  </div>
{:else}
  <img loading="lazy" class="{className} rounded-full" src={data.image} alt="User Icon" onerror={() => (errored = true)} />
{/if}
