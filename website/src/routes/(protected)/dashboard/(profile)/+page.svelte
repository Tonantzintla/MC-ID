<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$ui/card";
  import type { LayoutServerData } from "../$types";

  const { data }: { data: LayoutServerData } = $props();
</script>

<Card.Root class="w-full bg-background">
  <Card.Header>
    <Card.Title>Settings</Card.Title>
    <Card.Description>You can change your settings here</Card.Description>

    <Button
      onclick={async () =>
        await authClient.requestPasswordReset({
          email: data.user?.email!,
          redirectTo: "/dashboard" // The redirect URL after verification
        })}>{data.user?.email!}</Button>
  </Card.Header>
</Card.Root>
