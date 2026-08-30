<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { Accordion as AccordionPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...restProps
  }: AccordionPrimitive.RootProps = $props();
</script>

<AccordionPrimitive.Root
  bind:ref
  bind:value={value as never}
  data-slot="accordion"
  class={cn("flex w-full flex-col overflow-hidden rounded-2xl border", className)}
  {...restProps} />
