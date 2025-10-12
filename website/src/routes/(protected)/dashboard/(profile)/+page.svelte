<script lang="ts">
  import * as Card from "$ui/card";
  import type { LayoutServerData } from "../$types";

  const { data }: { data: LayoutServerData } = $props();
</script>

<Card.Root class="bg-background w-full">
  <Card.Header>
    <Card.Title>Settings</Card.Title>
    <Card.Description>You can change your settings here</Card.Description>
  </Card.Header>
</Card.Root>
