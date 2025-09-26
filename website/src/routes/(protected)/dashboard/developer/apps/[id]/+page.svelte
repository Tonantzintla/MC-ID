<script lang="ts">
  import * as Card from "$ui/card";
  import AppForm from "../app-form.svelte";
  import { AppFormVariant } from "../types.d";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<div class="mx-auto flex max-w-xl flex-col justify-start gap-8 self-center px-2 md:px-0">
  <Card.Root class="w-full bg-background">
    <Card.Content>
      <AppForm variant={AppFormVariant.EDIT} {data} />
    </Card.Content>
  </Card.Root>
</div>
