<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import MonitorIcon from "@lucide/svelte/icons/monitor";
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import { mode, resetMode, setMode } from "mode-watcher";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#if mode.current === "light"}
      <Button variant="outline" size="icon" aria-label="Change theme to dark mode">
        <SunIcon />
      </Button>
    {:else if mode.current === "dark"}
      <Button variant="outline" size="icon" aria-label="Change theme to light mode">
        <MoonIcon />
      </Button>
    {:else}
      <Button variant="outline" size="icon" aria-label="Change theme to system mode">
        <MonitorIcon />
      </Button>
    {/if}
  </DropdownMenu.Trigger>

  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.GroupHeading>Theme</DropdownMenu.GroupHeading>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onclick={() => setMode("light")}>
        <MoonIcon class="size-4" />
        Light
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => setMode("dark")}>
        <SunIcon class="size-4" />
        Dark
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={resetMode}>
        <MonitorIcon class="size-4" />
        System
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
