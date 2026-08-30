<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { PinInput as InputOTPPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(""),
    ...restProps
  }: InputOTPPrimitive.RootProps = $props();
</script>

<InputOTPPrimitive.Root
  bind:ref
  bind:value
  data-slot="input-otp"
  spellcheck={false}
  class={cn(
    "cn-input-otp-input flex items-center gap-2 disabled:cursor-not-allowed has-disabled:opacity-50",
    className
  )}
  {...restProps} />
