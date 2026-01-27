<script lang="ts">
  import { Checkbox } from "$ui/checkbox";
  import type { ComponentProps } from "svelte";

  let { checked = false, onCheckedChange = (v) => (checked = v), ...restProps }: ComponentProps<typeof Checkbox> = $props();
</script>

<Checkbox bind:checked={() => checked, onCheckedChange} {...restProps} />
