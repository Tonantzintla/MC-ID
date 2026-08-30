<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { Separator } from "$ui/separator/index.js";
  import type { ComponentProps } from "svelte";

  let { ref = $bindable(null), class: className, ...restProps }: ComponentProps<typeof Separator> = $props();
</script>

<Separator bind:ref data-slot="item-separator" orientation="horizontal" class={cn("my-2", className)} {...restProps} />
