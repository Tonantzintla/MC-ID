<script lang="ts">
  import { CopyButton } from "$ui/extras/copy-button";
  import type { PasswordCopyButtonProps } from "$ui/extras/password/types.js";
  import { cn } from "$lib/utils.js";
  import { usePasswordCopy } from "$ui/extras/password/password.svelte.js";

  let { ref = $bindable(null), class: className, ...rest }: PasswordCopyButtonProps = $props();

  const state = usePasswordCopy();
</script>

<CopyButton {...rest} bind:ref text={state.root.passwordState.value} tabindex={-1} class={cn("absolute top-1/2 right-0.5 size-8 min-w-0 -translate-y-1/2 bg-transparent p-0 text-muted-foreground shadow-none hover:!bg-transparent hover:text-foreground", className)} />
