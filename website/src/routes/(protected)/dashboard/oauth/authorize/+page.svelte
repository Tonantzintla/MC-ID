<script lang="ts">
  import { page } from "$app/state";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import * as Item from "$lib/components/ui/item";
  import * as Popover from "$lib/components/ui/popover";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Spinner } from "$lib/components/ui/spinner";
  import { IsHover } from "$lib/hooks/is-hover.svelte";
  import { scopes } from "$lib/scopes";
  import { cn } from "$lib/utils";
  import { tz } from "@date-fns/tz";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import { type Icon as IconType } from "@lucide/svelte";
  import BadgeCheck from "@lucide/svelte/icons/badge-check";
  import BookText from "@lucide/svelte/icons/book-text";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import Clock from "@lucide/svelte/icons/clock";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Info from "@lucide/svelte/icons/info";
  import Scale from "@lucide/svelte/icons/scale";
  import type { User } from "better-auth";
  import { format as formatDate } from "date-fns";
  import { getContext } from "svelte";
  import type { PageServerData } from "./$types";
  import { consent } from "./consent.remote";

  const { data }: { data: PageServerData } = $props();
  const { oauthClient, scope: requestedScopes, consent_code, redirectURI, error, error_description, status } = data;
  const user = $derived<User>(page.data?.user);
  const isHover = getContext<IsHover>("isHover");
  const appMetadata = $derived(oauthClient?.metadata ? JSON.parse(oauthClient.metadata) : null);

  const dataEmpty = $derived(oauthClient || requestedScopes || consent_code || redirectURI);

  const avatar = createAvatar(botttsNeutral, {
    size: 128,
    seed: oauthClient?.id ?? "default-avatar"
  });

  let declinePending = $state(false);
  let acceptPending = $state(false);
  let showPopover = $state(false);
</script>

<div class="@container mx-auto flex max-w-xl flex-col justify-start gap-8 self-center px-2 py-6 md:px-0">
  {#if dataEmpty || data.error}
    <Empty.Root class="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <Empty.Header>
        <Empty.Media variant="icon">
          <CircleX />
        </Empty.Media>
        {#if data.error}
          <Empty.Title>{data.error}</Empty.Title>
          {#if data.error_description}
            <Empty.Description>{@html data.error_description}</Empty.Description>
          {/if}
        {:else if dataEmpty}
          <Empty.Title>No Authorization Request</Empty.Title>
          <Empty.Description>There is no pending authorization request. If you were redirected here by an application, please try again.</Empty.Description>
        {/if}
      </Empty.Header>
      {#if dataEmpty}
        <Empty.Content>
          <Button href="/dashboard" variant="secondary">Go to Dashboard</Button>
        </Empty.Content>
      {/if}
    </Empty.Root>
  {:else}
    <Card.Root>
      <Card.Header>
        <div class="pointer-events-none flex select-none flex-nowrap items-center justify-center gap-4">
          <Avatar.Root class="pointer-events-none size-16 rounded-none sm:size-24">
            <Avatar.Image src={avatar.toDataUri()} alt="App Avatar" class="size-full" />
            <Avatar.Fallback class="rounded-none">{oauthClient?.name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>

          <div class="flex size-12 items-center justify-center sm:size-24">
            <Ellipsis class="opacity-30" />
          </div>

          <Avatar.Root class="pointer-events-none size-16 rounded-none sm:size-24">
            <Avatar.Image src="https://nmsr.nickac.dev/face/DarthGigi" alt={user.name} />
            <Avatar.Fallback class="rounded-none">{user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
        </div>
        <Card.Title class="mt-4 flex items-center justify-center gap-1.5 text-center text-2xl font-bold sm:text-3xl">
          {oauthClient?.name}

          {#if !appMetadata?.verified}
            <Popover.Root bind:open={showPopover}>
              <Popover.Trigger
                onpointerenter={() => {
                  if (!isHover.current) return;
                  showPopover = true;
                }}>
                <BadgeCheck class="text-primary pointer-events-none select-none" />
              </Popover.Trigger>
              <Popover.Content>
                <div class="flex items-center gap-2">
                  <BadgeCheck class="text-primary size-5" />
                  <span class="font-medium">Verified App</span>
                </div>
                <p class="text-muted-foreground mt-2 text-sm">This application has been verified by the MC-ID team.</p>
              </Popover.Content>
            </Popover.Root>
          {/if}
        </Card.Title>
        <Card.Description class="text-center sm:text-lg">wants to connect to your MC-ID account.</Card.Description>
      </Card.Header>
      <ScrollArea class="h-[30rem] w-full sm:h-full" type="auto">
        <Card.Content class="space-y-2">
          <Item.Group class="bg-accent rounded-lg p-4">
            <p class="text-muted-foreground text-sm">
              This will allow the developer of {oauthClient?.name} to:
            </p>
            {#each scopes as scope (scope.value)}
              {@render scopeItem({ canAccess: requestedScopes!.includes(scope.value), description: scope.consentDescription })}
            {/each}
          </Item.Group>

          {#if appMetadata?.description || appMetadata?.uri}
            <div class="bg-accent rounded-lg p-4">
              {#if appMetadata.description}
                {@render additionalItem({
                  IconComponent: BookText,
                  description: appMetadata.description
                })}
              {/if}
              {#if appMetadata.uri}
                {@render additionalItem({ IconComponent: Info, description: `For more information about this app, please visit: <a href="${appMetadata.uri}" class="underline" target="_blank" rel="noopener noreferrer">${appMetadata.uri}</a>` })}
              {/if}
            </div>
          {/if}

          <div class="bg-accent rounded-lg p-4">
            {@render additionalItem({ IconComponent: ExternalLink, description: `Once you authorize, you will be redirected <strong>outside of MC-ID</strong> to: <strong>${redirectURI}</strong>` })}
            {@render additionalItem({
              IconComponent: Scale,
              description: `The developer of ${oauthClient?.name}${oauthClient?.name?.endsWith("s") ? "'" : "'s"} ${appMetadata?.policyUri ? `<a href="${appMetadata.policyUri}" class="underline" target="_blank" rel="noopener noreferrer">privacy policy</a>` : "privacy policy"} and ${appMetadata?.tosUri ? `<a href="${appMetadata.tosUri}" class="underline" target="_blank" rel="noopener noreferrer">terms of service</a>` : "terms of service"} apply to this application`
            })}
            {@render additionalItem({ IconComponent: Clock, description: `Active since ${formatDate(new Date(oauthClient?.createdAt!), "MMM d, yyyy", { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}` })}
          </div>

          <Item.Group class="bg-accent rounded-lg p-4">
            <p class="text-muted-foreground text-sm">
              Apps can <strong><i>never</i></strong> do the following:
            </p>
            {@render additionalItem({ IconComponent: ChevronRight, description: "Make changes to your MC-ID or Microsoft account (e.g., change your email, password, or other settings) or log into your account" })}
            {@render additionalItem({ IconComponent: ChevronRight, description: "Make changes to your Minecraft profile (e.g., change your skin or other settings) or log into your account" })}
          </Item.Group>
        </Card.Content>
      </ScrollArea>

      <Card.Footer class="flex justify-center gap-2">
        <Button
          class="flex-1 text-base"
          variant="secondary"
          onclick={async () => {
            declinePending = true;
            await consent({
              accept: false,
              consent_code: consent_code!
            }).finally(() => {
              declinePending = false;
            });
          }}>
          Cancel
          {#if declinePending}
            <Spinner />
          {/if}
        </Button>
        <Button
          class="flex-1 text-base"
          onclick={async () => {
            acceptPending = true;
            await consent({
              accept: true,
              consent_code: consent_code!
            }).finally(() => {
              acceptPending = false;
            });
          }}>
          Authorize
          {#if acceptPending}
            <Spinner />
          {/if}
        </Button>
      </Card.Footer>
    </Card.Root>
  {/if}
</div>

{#snippet scopeItem({ canAccess, description }: { canAccess: boolean; description: string })}
  <Item.Root variant="default" size="sm" class={cn("py-2", { "opacity-50": !canAccess })}>
    <Item.Media>
      {#if canAccess}
        <CircleCheck class="text-primary size-5" />
      {:else}
        <CircleX class="size-5" />
      {/if}
    </Item.Media>
    <Item.Content>
      <Item.Title>{description}</Item.Title>
    </Item.Content>
  </Item.Root>
{/snippet}

{#snippet additionalItem({ IconComponent, description }: { IconComponent: typeof IconType; description: string })}
  <Item.Root variant="default" size="sm" class="py-2 opacity-50">
    <Item.Media>
      <IconComponent class="size-5" />
    </Item.Media>
    <Item.Content>
      <Item.Title><p>{@html description}</p></Item.Title>
    </Item.Content>
  </Item.Root>
{/snippet}
