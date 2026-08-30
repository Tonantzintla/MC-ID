<script lang="ts">
  import type { WithElementRef } from "$utils.js";
  import { cn } from "$utils.js";
  import MinusIcon from "@lucide/svelte/icons/minus";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="input-otp-separator"
  role="separator"
  class={cn("flex items-center [&_svg:not([class*='size-'])]:size-4", className)}
  {...restProps}>
  {#if children}
    {@render children?.()}
  {:else}
    <MinusIcon />
  {/if}
</div>
