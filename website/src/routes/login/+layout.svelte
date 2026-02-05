<script lang="ts">
  import Header from "$components/header.svelte";
  import type { LayoutProps } from "./$types";

  const { children }: LayoutProps = $props();
</script>

<Header />

<div class="mx-auto w-full max-w-md px-4 pt-24 md:pt-36">
  {@render children()}
</div>
