<script lang="ts">
  import type { LayoutProps } from "./$types";

  const { children }: LayoutProps = $props();
</script>

<div class="mx-auto mb-8 flex max-w-6xl flex-col justify-start gap-8 self-center px-2 md:px-0">
  {@render children?.()}
</div>
