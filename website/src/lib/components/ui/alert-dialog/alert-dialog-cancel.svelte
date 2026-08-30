<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { buttonVariants, type ButtonVariant, type ButtonSize } from "$ui/button/index.js";
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    variant = "outline",
    size = "default",
    ...restProps
  }: AlertDialogPrimitive.CancelProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  } = $props();
</script>

<AlertDialogPrimitive.Cancel
  bind:ref
  data-slot="alert-dialog-cancel"
  class={cn(buttonVariants({ variant, size }), "cn-alert-dialog-cancel", className)}
  {...restProps} />
