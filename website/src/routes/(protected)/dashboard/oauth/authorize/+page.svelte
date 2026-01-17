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
  import type { PrimaryMcAccount } from "$lib/types/global";
  import { cn } from "$lib/utils";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import { type Icon as IconType } from "@lucide/svelte";
  import BadgeCheck from "@lucide/svelte/icons/badge-check";
  import BookText from "@lucide/svelte/icons/book-text";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Info from "@lucide/svelte/icons/info";
  import Scale from "@lucide/svelte/icons/scale";
  import type { User } from "better-auth";
  import type { AvatarRootProps } from "bits-ui";
  import { getContext } from "svelte";
  import { toast } from "svelte-sonner";
  import type { PageServerData } from "./$types";
  import { consent } from "./consent.remote";

  const { data }: { data: PageServerData } = $props();
  const { oauthClient, scope: requestedScopes, oauthQuery } = $derived(data);
  const user = $derived<User>(page.data?.user);
  const primaryMcAccount = $derived<PrimaryMcAccount>(page.data?.primaryMcAccount);
  const isHover = getContext<IsHover>("isHover");

  const dataEmpty = $derived(!oauthClient || !requestedScopes);

  const preMadeAvatar = $derived(
    createAvatar(botttsNeutral, {
      size: 128,
      seed: oauthClient?.client_id
    }).toDataUri()
  );

  const avatar = $derived.by(() => {
    if (oauthClient?.logo_uri) return `/api/internal/image-proxy?url=${encodeURIComponent(oauthClient.logo_uri)}`;
    return preMadeAvatar;
  });

  let declinePending = $state(false);
  let acceptPending = $state(false);
  let showPopover = $state(false);
  let loadingStatus = $state<AvatarRootProps["loadingStatus"]>("loading");
</script>

<div class="@container mx-auto flex max-w-xl flex-col justify-start gap-8 self-center px-2 py-6 md:px-0">
  {#if dataEmpty || data.error}
    <Empty.Root class="h-full bg-linear-to-b from-muted/50 from-30% to-background">
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
        <div class="pointer-events-none flex flex-nowrap items-center justify-center gap-4 select-none">
          <Avatar.Root bind:loadingStatus class="pointer-events-none size-16 rounded-none sm:size-24">
            <Avatar.Image src={avatar} alt="App Avatar" class="size-full" />
            <Avatar.Fallback class="rounded-none">
              {#if oauthClient?.logo_uri && loadingStatus === "error"}
                <Avatar.Root class="pointer-events-none size-16 rounded-none sm:size-24">
                  <Avatar.Image src={preMadeAvatar} alt="App Avatar" class="size-full" />
                  <Avatar.Fallback class="rounded-none">{oauthClient?.client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>
              {:else}
                {oauthClient?.client_name?.slice(0, 2).toUpperCase()}
              {/if}
            </Avatar.Fallback>
          </Avatar.Root>

          <div class="flex size-12 items-center justify-center sm:size-24">
            <Ellipsis class="opacity-30" />
          </div>

          <Avatar.Root class="pointer-events-none size-16 rounded-none sm:size-24">
            <Avatar.Image src={`https://nmsr.nickac.dev/face/${primaryMcAccount.uuid}`} alt={user.name} />
            <Avatar.Fallback class="rounded-none">{user.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
        </div>
        <Card.Title class="mt-4 flex items-center justify-center gap-1.5 text-center text-2xl font-bold sm:text-3xl">
          {oauthClient?.client_name}

          {#if oauthClient?.verified}
            <Popover.Root bind:open={showPopover}>
              <Popover.Trigger
                onpointerenter={() => {
                  if (!isHover.current) return;
                  showPopover = true;
                }}>
                <BadgeCheck class="pointer-events-none text-primary select-none" />
              </Popover.Trigger>
              <Popover.Content>
                <div class="flex items-center gap-2">
                  <BadgeCheck class="size-5 text-primary" />
                  <span class="font-medium">Verified App</span>
                </div>
                <p class="mt-2 text-sm text-muted-foreground">This application has been verified by the MC-ID team.</p>
              </Popover.Content>
            </Popover.Root>
          {/if}
        </Card.Title>
        <Card.Description class="text-center sm:text-lg">wants to connect to your MC-ID account.</Card.Description>
      </Card.Header>
      <ScrollArea class="h-120 w-full sm:h-full" type="auto">
        <Card.Content class="space-y-2">
          <Item.Group class="rounded-lg bg-accent p-4">
            <p class="text-sm text-muted-foreground">
              This will allow the developer of {oauthClient?.client_name} to:
            </p>
            {#each scopes as scope (scope.value)}
              {@render scopeItem({ canAccess: requestedScopes!.includes(scope.value), description: scope.consentDescription })}
            {/each}
          </Item.Group>

          {#if oauthClient?.description || oauthClient?.client_uri}
            <div class="rounded-lg bg-accent p-4">
              {#if oauthClient.description}
                {@render additionalItem({
                  IconComponent: BookText,
                  description: oauthClient.description as string
                })}
              {/if}
              {#if oauthClient.client_uri}
                {@render additionalItem({ IconComponent: Info, description: `For more information about this app, please visit: <a href="${oauthClient.client_uri}" class="underline" target="_blank" rel="noopener noreferrer">${oauthClient.client_uri}</a>` })}
              {/if}
            </div>
          {/if}

          <div class="rounded-lg bg-accent p-4">
            {@render additionalItem({ IconComponent: ExternalLink, description: `Once you authorize, you will be redirected <strong>outside of MC-ID</strong>.` })}
            {@render additionalItem({
              IconComponent: Scale,
              description: `The developer of ${oauthClient?.client_name}${oauthClient?.client_name?.endsWith("s") ? "'" : "'s"} ${oauthClient?.policy_uri ? `<a href="${oauthClient.policy_uri}" class="underline" target="_blank" rel="noopener noreferrer">privacy policy</a>` : "privacy policy"} and ${oauthClient?.tos_uri ? `<a href="${oauthClient.tos_uri}" class="underline" target="_blank" rel="noopener noreferrer">terms of service</a>` : "terms of service"} apply to this application`
            })}
          </div>

          <Item.Group class="rounded-lg bg-accent p-4">
            <p class="text-sm text-muted-foreground">
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
            const result = await consent({
              accept: false,
              scopes: requestedScopes,
              oauth_query: oauthQuery || ""
            })
              .finally(() => {
                declinePending = false;
              })
              .catch((err) => {
                console.error("Error during authorization decline:", err);
                toast.error("An unknown error occurred while processing your authorization.");
              });

            if (result && result.status === 307) {
              window.location.href = result.redirect;
            }
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
            const result = await consent({
              accept: true,
              scopes: requestedScopes,
              oauth_query: oauthQuery || ""
            })
              .finally(() => {
                acceptPending = false;
              })
              .catch((err) => {
                console.error("Error during authorization consent:", err);
                toast.error("An unknown error occurred while processing your authorization.");
              });
            if (result && result.status === 307) {
              window.location.href = result.redirect;
            }
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
        <CircleCheck class="size-5 text-primary" />
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
