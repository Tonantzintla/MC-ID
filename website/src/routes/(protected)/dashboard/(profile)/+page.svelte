<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$ui/card";
</script>

<Card.Root class="w-full bg-background">
  <Card.Header>
    <Card.Title>Settings</Card.Title>
    <Card.Description>You can change your settings here</Card.Description>

    <Button
      onclick={async () =>
        await authClient.linkSocial({
          provider: "mc-id" // or any other provider id
        })}>MC-ID</Button>
  </Card.Header>
</Card.Root>
