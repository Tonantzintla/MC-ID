<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";
  import * as InputGroup from "$ui/input-group/index.js";
  import SearchIcon from "@lucide/svelte/icons/search";

  let { ref = $bindable(null), class: className, value = $bindable(""), ...restProps }: CommandPrimitive.InputProps = $props();
</script>

<div data-slot="command-input-wrapper" class="p-1 pb-0">
  <InputGroup.Root class="h-9 bg-input/50">
    <CommandPrimitive.Input data-slot="command-input" class={cn("w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className)} bind:ref {...restProps} bind:value />
    <InputGroup.Addon>
      <SearchIcon class="size-4 shrink-0 opacity-50" />
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
