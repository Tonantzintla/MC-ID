<script lang="ts">
  import HeroOne from "$components/blocks/hero/hero-one.svelte";
  import DeveloperSection from "$components/blocks/home/developer-section.svelte";
  import UserSection from "$components/blocks/home/user-section.svelte";
  import Header from "$components/header.svelte";
  import ThemeSelector from "$components/theme-selector.svelte";
</script>

<Header />

<HeroOne />
<UserSection />
<DeveloperSection />
<div class="fixed right-4 bottom-4 rounded-md bg-card">
  <ThemeSelector />
</div>
