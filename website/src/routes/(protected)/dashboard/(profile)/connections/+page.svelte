<script lang="ts">
  import { resolve } from "$app/paths";
  import * as Card from "$lib/components/ui/card";
  import * as Item from "$lib/components/ui/item";
  import { Separator } from "$lib/components/ui/separator";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import MessageCircleMore from "@lucide/svelte/icons/message-circle-more";
  import Pickaxe from "@lucide/svelte/icons/pickaxe";

  const quickLinks = [
    {
      title: "Minecraft",
      description: "Manage your linked Minecraft accounts.",
      href: resolve("/dashboard/connections/minecraft"),
      icon: Pickaxe
    },
    {
      title: "Discord",
      description: "Manage your linked Discord account.",
      href: resolve("/dashboard/connections/discord"),
      icon: MessageCircleMore
    }
  ];
</script>

<Card.Root class="w-full bg-background">
  <Card.Header>
    <Card.Title>Connections</Card.Title>
    <Card.Description>Manage and link your connected accounts such as Minecraft and Discord.</Card.Description>
  </Card.Header>

  <Separator />

  <Card.Content class="flex w-full flex-col gap-4">
    {#each quickLinks as link, index (index)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href={link.href} {...props}>
            <Item.Media variant="icon">
              <link.icon />
            </Item.Media>
            <Item.Content>
              <Item.Title>{link.title}</Item.Title>
              <Item.Description>
                {link.description}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <ChevronRight class="size-4" />
            </Item.Actions>
          </a>
        {/snippet}
      </Item.Root>
    {/each}
  </Card.Content>
</Card.Root>
