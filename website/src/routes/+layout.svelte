<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { IsHover } from "$lib/hooks/is-hover.svelte";
  import * as Tooltip from "$ui/tooltip";
  import { setContext } from "svelte";
  import { Toaster, type ToasterProps } from "svelte-sonner";
  import "../app.css";

  const { children } = $props();

  let position = $state<ToasterProps["position"]>("bottom-right");
  let closeButton = $state<ToasterProps["closeButton"]>(true);
  let isHover = $state(new IsHover());

  setContext("isHover", isHover);
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
