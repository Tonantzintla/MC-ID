<script lang="ts">
  import * as Card from "$ui/card";
  import { Separator } from "$ui/separator";
  import type { PageProps } from "./$types";
  import DeletionForm from "./deletion-form.svelte";
  import ProfileForm from "./profile-form.svelte";

  const { data }: PageProps = $props();
</script>

<Card.Root class="w-full bg-background">
  <Card.Header>
    <Card.Title>Profile</Card.Title>
    <Card.Description>You can edit your profile here</Card.Description>
  </Card.Header>

  <Separator />

  <Card.Content>
    <ProfileForm {data} />
  </Card.Content>
</Card.Root>

<Card.Root class="w-full border-destructive/10 bg-destructive/5">
  <Card.Header>
    <Card.Title>Danger Zone</Card.Title>
    <Card.Description>This is the last chance to turn back. Once you delete your account, there is no going back. Please be certain.</Card.Description>
  </Card.Header>

  <Separator class="bg-destructive/10" />

  <Card.Content>
    <DeletionForm {data} />
  </Card.Content>
</Card.Root>
