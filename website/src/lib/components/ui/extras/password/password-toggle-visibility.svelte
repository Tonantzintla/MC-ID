<script lang="ts">
  import { Toggle } from "$ui/extras/toggle";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EyeOffIcon from "@lucide/svelte/icons/eye-off";
  import { usePasswordToggleVisibility } from "$ui/extras/password/password.svelte.js";
  import type { PasswordToggleVisibilityProps } from "$ui/extras/password/types.js";
  import { cn } from "$lib/utils.js";

  let { ref = $bindable(null), class: className }: PasswordToggleVisibilityProps = $props();

  const state = usePasswordToggleVisibility();
</script>

<Toggle
  bind:ref
  aria-label={state.root.opts.hidden.current ? "Show password" : "Hide password"}
  bind:pressed={state.root.opts.hidden.current}
  class={cn(
    "absolute top-1/2 right-0.5 size-8 min-w-0 -translate-y-1/2 bg-transparent p-0 text-muted-foreground hover:!bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground",
    {
      "right-8.5": state.root.passwordState.copyMounted
    },
    className
  )}
  tabindex={-1}>
  {#if state.root.opts.hidden.current}
    <EyeIcon class="size-4" />
  {:else}
    <EyeOffIcon class="size-4" />
  {/if}
</Toggle>
