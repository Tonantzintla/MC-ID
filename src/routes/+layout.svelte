<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import * as Tooltip from "$ui/tooltip";
  import { Toaster, type ToasterProps } from "svelte-sonner";
  import "../app.css";

  const { children } = $props();

  let position = $state<ToasterProps["position"]>("bottom-right");
  let closeButton = $state<ToasterProps["closeButton"]>(true);
</script>

<svelte:window
  onresize={() => {
    if (window.innerWidth < 768) {
      position = "top-center";
      closeButton = false;
    } else {
      position = "bottom-right";
      closeButton = true;
    }
  }} />

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Toaster theme="dark" {closeButton} {position} />

<Tooltip.Provider delayDuration={0}>
  <svelte:boundary>
    {@render children?.()}
    {#snippet pending()}{/snippet}
  </svelte:boundary>
</Tooltip.Provider>
