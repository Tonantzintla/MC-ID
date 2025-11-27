<script lang="ts">
  import { resolve } from "$app/paths";
  import * as Card from "$lib/components/ui/card";
  import * as Item from "$lib/components/ui/item";
  import { Separator } from "$lib/components/ui/separator";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import CodeXmlIcon from "@lucide/svelte/icons/code-xml";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Key from "@lucide/svelte/icons/key";

  const quickLinks = [
    {
      title: "Apps",
      description: "Register and manage your applications.",
      href: resolve("/dashboard/developer/apps"),
      icon: CodeXmlIcon
    },
    {
      title: "API Keys",
      description: "Create and manage your API keys.",
      href: resolve("/dashboard/developer/keys"),
      icon: Key
    },
    {
      title: "Documentation",
      description: "Read the MC-ID developer documentation.",
      href: "https://docs.mc-id.com",
      icon: ExternalLink,
      external: "_blank"
    },
    {
      title: "API Reference",
      description: "Explore the MC-ID API reference.",
      href: "https://mc-id.com/api",
      icon: ExternalLink,
      external: "_blank"
    }
  ];
</script>

<div class="mx-auto mb-8 flex max-w-xl flex-col justify-start gap-8 self-center px-2 md:px-0">
  <Card.Root class="w-full bg-background">
    <Card.Header>
      <Card.Title>Developer Dashboard</Card.Title>
      <Card.Description>Welcome to the Developer Dashboard! Here are some quick links to get you started.</Card.Description>
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
</div>
