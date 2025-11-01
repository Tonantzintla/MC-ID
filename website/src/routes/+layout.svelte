<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { IsHover } from "$lib/hooks/is-hover.svelte";
  import * as Tooltip from "$ui/tooltip";
  import { setContext } from "svelte";
  import SvelteSeo from "svelte-seo";
  import { Toaster, type ToasterProps } from "svelte-sonner";
  import "../app.css";

  const { children } = $props();

  let position = $state<ToasterProps["position"]>("bottom-right");
  let closeButton = $state<ToasterProps["closeButton"]>(true);
  let isHover = $state(new IsHover());

  const ogTitle = "MC-ID" as const;
  const ogDescription = "MC-ID is a unified account system for Minecraft services, providing a seamless login experience across multiple platforms." as const;

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

<SvelteSeo
  title={ogTitle}
  description={ogDescription}
  canonical="https://mc-id.com"
  openGraph={{
    title: ogTitle,
    description: ogDescription,
    type: "website",
    url: "https://mc-id.com",
    // @ts-expect-error It accepts any property
    image: "/assets/images/MC-ID.png",
    images: [
      {
        url: "/assets/images/MC-ID.png",
        alt: "MC-ID Logo",
        width: 1024,
        height: 1024,
        secure_url: "https://mc-id.com/assets/images/MC-ID.png",
        type: "image/png"
      }
    ]
  }}
  themeColor="#000000"
  twitter={{
    title: "MC-ID",
    description: ogDescription,
    image: "/assets/images/MC-ID.png",
    imageAlt: "MC-ID Logo",
    card: "summary",
    creator: "@DarthGigi"
  }} />

<Toaster theme="dark" {closeButton} {position} />

<Tooltip.Provider delayDuration={0}>
  <svelte:boundary>
    {@render children?.()}
    {#snippet pending()}{/snippet}
  </svelte:boundary>
</Tooltip.Provider>
