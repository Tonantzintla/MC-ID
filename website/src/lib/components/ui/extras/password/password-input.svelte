<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { box, mergeProps } from "svelte-toolbelt";
  import { usePasswordInput } from "$ui/extras/password/password.svelte.js";
  import type { PasswordInputProps } from "$ui/extras/password/types.js";
  import { Input } from "$ui/extras/input";

  let { ref = $bindable(null), value = $bindable(""), class: className, children, ...rest }: PasswordInputProps = $props();

  const state = usePasswordInput({
    value: box.with(
      () => value,
      (v) => (value = v)
    ),
    ref: box.with(() => ref)
  });

  const mergedProps = $derived(mergeProps(rest, state.props));
</script>

<div class="relative">
  <Input
    {...mergedProps}
    bind:value
    bind:ref
    type={state.root.opts.hidden.current ? "password" : "text"}
    class={cn(
      "transition-[width]",
      {
        // either control is mounted
        "pr-10": state.root.passwordState.copyMounted || state.root.passwordState.toggleMounted,
        // both are mounted (offset 36px * 2)
        "pr-[4.5rem]": state.root.passwordState.copyMounted && state.root.passwordState.toggleMounted
      },
      className
    )} />
  {@render children?.()}
</div>
