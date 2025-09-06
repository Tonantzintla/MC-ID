<script lang="ts">
  import * as Card from "$ui/card";
  import { Separator } from "$ui/separator";
  import type { PageProps } from "./$types";
  import Passkeys from "./passkeys.svelte";
  import PasswordForm from "./password-form.svelte";

  const { data }: PageProps = $props();
</script>

<Card.Root class="w-full bg-background">
  <Card.Header>
    <Card.Title>Settings</Card.Title>
    <Card.Description>You can change your settings here</Card.Description>
  </Card.Header>

  <Separator />

  <Card.Content>
    <PasswordForm {data} />
  </Card.Content>

  <Separator />

  <Card.Content>
    <Passkeys />
  </Card.Content>
</Card.Root>
