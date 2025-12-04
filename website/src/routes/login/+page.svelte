<script lang="ts">
  import Header from "$components/header.svelte";
  import ThemeSelector from "$components/theme-selector.svelte";
  import * as Tabs from "$ui/tabs";
  import { cubicOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import type { PageProps } from "./$types";
  import LoginForm from "./login-form.svelte";
  import SignupForm from "./signup-form.svelte";

  let { data }: PageProps = $props();

  let value = $state<"login" | "sign-up">("login");

  const tabs = [
    { title: "Login", value: "login" },
    { title: "Sign Up", value: "sign-up" }
  ];

  const handleSignUpButtonClick = () => {
    value = "sign-up";
  };

  const handleSignInButtonClick = () => {
    value = "login";
  };

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicOut
  });
</script>

<Header menuItems={[{ name: "Home", href: "/" }]} showLoginButtons={false} />

<Tabs.Root bind:value class="mx-auto w-full max-w-md px-4 pt-24 md:pt-36">
  <Tabs.List class="grid w-full grid-cols-2 gap-4 bg-background">
    {#each tabs as tab (tab.value)}
      {@const isActive = value === tab.value}
      <Tabs.Trigger value={tab.value} class="relative border-none data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent" data-sveltekit-noscroll data-state={isActive ? "active" : "inactive"}>
        {#if isActive}
          <div class="absolute inset-0 rounded-md bg-primary" in:send={{ key: "active-tab" }} out:receive={{ key: "active-tab" }}></div>
        {/if}
        <div class="relative">
          {tab.title}
        </div>
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  <Tabs.Content value="login">
    <LoginForm {data} {handleSignUpButtonClick} />
  </Tabs.Content>
  <Tabs.Content value="sign-up">
    <SignupForm {data} {handleSignInButtonClick} />
  </Tabs.Content>
</Tabs.Root>

<div class="fixed right-4 bottom-4 rounded-md bg-card">
  <ThemeSelector />
</div>
