<script lang="ts">
  import { cn, type WithoutChild } from "$lib/utils.js";
  import * as FormPrimitive from "formsnap";

  let {
    ref = $bindable(null),
    class: className,
    errorClasses,
    children: childrenProp,
    variant = "multiple",
    ...restProps
  }: WithoutChild<FormPrimitive.FieldErrorsProps> & {
    errorClasses?: string | undefined | null;
    variant?: "multiple" | "single";
  } = $props();
</script>

<FormPrimitive.FieldErrors bind:ref class={cn("text-sm font-medium text-destructive", className)} {...restProps}>
  {#snippet children({ errors, errorProps })}
    {#if childrenProp}
      {@render childrenProp({ errors, errorProps })}
    {:else if variant === "single"}
      <div {...errorProps} class={cn(errorClasses)}>{errors[0]}</div>
    {:else}
      {#each errors as error (error)}
        <div {...errorProps} class={cn(errorClasses)}>{error}</div>
      {/each}
    {/if}
  {/snippet}
</FormPrimitive.FieldErrors>
