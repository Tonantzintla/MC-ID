<script lang="ts">
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import { tz } from "@date-fns/tz";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import { formatDistanceStrict } from "date-fns";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import AppForm from "./app-form.svelte";
  import { AppFormVariant, type DeveloperApp } from "./types.d";

  const { data }: PageProps = $props();
  const { appsData: apps } = data;

  let currentTime = $state(new Date());

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  });
</script>

<div class="@container mx-auto flex max-w-xl flex-col justify-start gap-8 self-center px-2 py-6 md:px-0">
  <Card.Root class="w-full bg-background">
    <Card.Header>
      <Card.Title>Apps</Card.Title>
      <Card.Description>Manage your apps</Card.Description>
    </Card.Header>

    <Card.Content>
      <AppForm variant={AppFormVariant.CREATE} {data} />
    </Card.Content>
    <div class="grid grid-cols-1 gap-4 px-6 py-6 @lg:grid-cols-2">
      {#each apps as app (app.id)}
        {@render appCard(app)}
      {/each}
    </div>
  </Card.Root>
</div>

{#snippet appCard(app: DeveloperApp)}
  {@const avatar = createAvatar(botttsNeutral, {
    size: 128,
    seed: app.id ?? "default-avatar"
  })}
  <Button href="apps/{app.id}" class="contents cursor-pointer">
    <Card.Root class="gap-0 space-y-2 truncate p-0 pb-2">
      <div class="bg-(--bgColor,transparent)" style="--bgColor: {avatar.toJson().extra.primaryBackgroundColor}">
        <Avatar.Root class="pointer-events-none mx-auto flex size-40 flex-shrink-0 justify-center rounded-none select-none">
          <Avatar.Image src={avatar.toDataUri()} alt="App Avatar" class="size-full" />
          <Avatar.Fallback>{app.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <Card.Header class="my-0 items-center justify-center px-6 py-0 text-center">
        <Card.Title class="text-lg">{app.name}</Card.Title>
      </Card.Header>

      <Card.Description class="w-full truncate px-6 text-center">
        {app.description || "No description provided."} Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iusto commodi eos et fugiat quidem ullam, accusantium provident vel eveniet fugit illum dolor dolorem, error, corporis culpa nesciunt laudantium reiciendis. Dolore.
      </Card.Description>

      <Card.Footer>
        {@const isSameTime = new Date(app.createdAt).getTime() === new Date(app.updatedAt).getTime()}
        <Card.Description class="mx-auto text-xs">{isSameTime ? "Created" : "Updated"} {formatDistanceStrict(isSameTime ? app.createdAt : app.updatedAt, currentTime, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}</Card.Description>
      </Card.Footer>
    </Card.Root>
  </Button>
{/snippet}
