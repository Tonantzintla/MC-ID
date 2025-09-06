<script lang="ts" module>
  let tabsElement: HTMLDivElement = $state(null!);

  export function scrollToTabs() {
    if (tabsElement) tabsElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

<script lang="ts">
  import { page } from "$app/state";
  import Developers from "$components/blocks/developers/developers.svelte";
  import HeroOne from "$components/blocks/hero/hero-one.svelte";
  import Users from "$components/blocks/users/users.svelte";
  import Header from "$components/header.svelte";
  import * as Tabs from "$ui/tabs";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  let value = $state<"users" | "developers">("users");

  const direction = $derived(value === "users" ? "left" : "right");

  const tabs = [
    { title: "Users", value: "users" },
    { title: "Developers", value: "developers" }
  ];

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });

  $effect.pre(() => {
    if (page.url.hash === "#developers") {
      value = "developers";
      scrollToTabs();
    }
  });
</script>

<Header
  menuItems={[
    { name: "Developers", href: "#developers" },
    { name: "GitHub", href: "https://github.com/Tonantzintla/MC-ID-Website" }
  ]} />

<HeroOne />

<Tabs.Root bind:value class="contents">
  <Tabs.List bind:ref={tabsElement} class="mx-auto mt-16 block h-auto scroll-m-28 rounded-full bg-gradient-to-r p-0 transition-all duration-300 ease-out data-[direction=left]:from-accent data-[direction=left]:to-transparent data-[direction=right]:from-transparent data-[direction=right]:to-accent" data-direction={direction}>
    {#each tabs as tab (tab.value)}
      {@const isActive = value === tab.value}
      <Tabs.Trigger value={tab.value} class="relative rounded-full border-none data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent" data-sveltekit-noscroll data-state={isActive ? "active" : "inactive"}>
        {#if isActive}
          <div class="absolute inset-0 top-1/2 left-1/2 w-full -translate-1/2 rounded-full border bg-accent p-4" in:send={{ key: "active-tab" }} out:receive={{ key: "active-tab" }}></div>
        {/if}
        <div class="relative text-lg">
          {tab.title}
        </div>
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  <Tabs.Content value={tabs[0].value}>
    <Users />
  </Tabs.Content>
  <Tabs.Content value={tabs[1].value}>
    <Developers />
  </Tabs.Content>
</Tabs.Root>
