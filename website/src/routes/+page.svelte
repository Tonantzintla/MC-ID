<script lang="ts">
  import HeroOne from "$components/blocks/hero/hero-one.svelte";
  import DeveloperSection from "$components/blocks/home/developer-section.svelte";
  import UserSection from "$components/blocks/home/user-section.svelte";
  import Header from "$components/header.svelte";
</script>

<Header
  menuItems={[
    { name: "Docs", href: "https://docs.mc-id.com" },
    { name: "GitHub", href: "https://github.com/Tonantzintla/MC-ID" }
  ]} />

<HeroOne />
<UserSection />
<DeveloperSection />
