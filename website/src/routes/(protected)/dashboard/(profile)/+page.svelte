<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import * as Card from "$lib/components/ui/card";
  import * as Item from "$lib/components/ui/item";
  import { Separator } from "$lib/components/ui/separator";
  import type { PrimaryMcAccount } from "$lib/types/global";
  import Book from "@lucide/svelte/icons/book";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Code from "@lucide/svelte/icons/code";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import LinkIcon from "@lucide/svelte/icons/link";
  import User from "@lucide/svelte/icons/user";

  const primaryMcAccount = $derived<PrimaryMcAccount | undefined>(page.data?.primaryMcAccount);

  const quickLinks = [
    {
      title: "Profile Settings",
      description: "Manage your account details and preferences.",
      href: resolve("/dashboard/settings/profile"),
      icon: User
    },
    {
      title: "Connections",
      description: "Link your Minecraft, Discord, and other accounts.",
      href: resolve("/dashboard/connections"),
      icon: LinkIcon
    },
    {
      title: "Developer Portal",
      description: "Register applications and manage API keys.",
      href: resolve("/dashboard/developer"),
      icon: Code
    },
    {
      title: "Documentation",
      description: "Learn how to integrate MC-ID into your projects.",
      href: "https://docs.mc-id.com",
      icon: Book,
      external: true
    }
  ];
</script>

<Card.Root class="w-full bg-background">
  <Card.Header>
    <Card.Title>Dashboard</Card.Title>
    <Card.Description>
      Welcome back{#if primaryMcAccount}, {primaryMcAccount.username}{/if}! Here are some quick links to get you started.
    </Card.Description>
  </Card.Header>

  <Separator />

  <Card.Content class="flex w-full flex-col gap-4">
    {#each quickLinks as link, index (index)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noreferrer" : undefined} {...props}>
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
              {#if link.external}
                <ExternalLink class="size-4" />
              {:else}
                <ChevronRight class="size-4" />
              {/if}
            </Item.Actions>
          </a>
        {/snippet}
      </Item.Root>
    {/each}
  </Card.Content>
</Card.Root>
