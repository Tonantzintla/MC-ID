<script lang="ts">
  import { Scope, scopes } from "$lib/scopes";
  import { cn } from "$lib/utils";
  import * as AlertDialog from "$ui/alert-dialog";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Collapsible from "$ui/collapsible";
  import * as Dialog from "$ui/dialog";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import * as Empty from "$ui/empty";
  import * as Item from "$ui/item";
  import { Separator } from "$ui/separator";
  import { Spinner } from "$ui/spinner";
  import type { OAuthClient, OAuthConsent } from "@better-auth/oauth-provider";
  import { tz } from "@date-fns/tz";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import type { Icon as IconType } from "@lucide/svelte";
  import BookText from "@lucide/svelte/icons/book-text";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import CircleCheck from "@lucide/svelte/icons/circle-check";
  import CircleX from "@lucide/svelte/icons/circle-x";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import FingerprintPattern from "@lucide/svelte/icons/fingerprint-pattern";
  import Info from "@lucide/svelte/icons/info";
  import Scale from "@lucide/svelte/icons/scale";
  import SearchAlert from "@lucide/svelte/icons/search-alert";
  import type { AvatarRootProps } from "bits-ui";
  import { format, formatDistanceToNowStrict } from "date-fns";
  import { toast } from "svelte-sonner";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import { deleteConsent, getConsentedApps } from "./consented-apps.remote";

  const generateAvatar = (clientId?: string) =>
    createAvatar(botttsNeutral, {
      size: 128,
      seed: clientId ?? "default"
    }).toDataUri();

  const getAvatar = ({ logoUri, clientId }: { logoUri?: string; clientId?: string }) => {
    if (logoUri) return `/api/internal/image-proxy?url=${encodeURIComponent(logoUri)}`;
    return generateAvatar(clientId);
  };

  let selectedAppForInfo: OAuthClient | null = $state(null);
  let selectedAppForDeauth: { app: OAuthClient; consent: OAuthConsent<Scope[]> } | null = $state(null);
  let loadingStatus = $state<AvatarRootProps["loadingStatus"]>("loading");
  let loadingStatusDialog = $state<AvatarRootProps["loadingStatus"]>("loading");
  let dialogOpen = $derived(selectedAppForInfo !== null);
  let alertDialogOpen = $derived(selectedAppForDeauth !== null);
  let deauthorizing = $state<boolean>(false);
</script>

<Card.Root class="w-full bg-background">
  <Card.Header>
    <Card.Title>Authorized Applications</Card.Title>
    <Card.Description>Manage third-party applications that have access to your account information.</Card.Description>
  </Card.Header>

  <Separator />

  <Card.Content>
    <div class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
      <div class="space-y-2">
        <div class="space-y-2">
          <svelte:boundary>
            {@const authorizations = await getConsentedApps()}
            {#if authorizations.length === 0}
              {@render empty({
                title: "No Consented Apps Yet",
                description: "You haven't consented to any applications yet. Manage your authorized applications here.",
                Icon: FingerprintPattern
              })}
            {:else}
              {#each authorizations as authorization, index (authorization.publicApp.client_id + index)}
                <Item.Root variant="outline" class="flex-col items-start">
                  <div class="flex w-full flex-wrap items-center gap-4">
                    <Item.Media>
                      <Avatar.Root bind:loadingStatus class="pointer-events-none size-10 rounded-none">
                        <Avatar.Image src={getAvatar({ logoUri: authorization.publicApp.logo_uri, clientId: authorization.publicApp.client_id })} alt="App Avatar" class="size-full" />
                        <Avatar.Fallback class="rounded-none">
                          {#if authorization?.publicApp.logo_uri && loadingStatus === "error"}
                            <Avatar.Root class="pointer-events-none size-10 rounded-none">
                              <Avatar.Image src={getAvatar({ logoUri: authorization.publicApp.logo_uri, clientId: authorization.publicApp.client_id })} alt="App Avatar" class="size-full" />
                              <Avatar.Fallback class="rounded-none">{authorization?.publicApp.client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                            </Avatar.Root>
                          {:else}
                            {authorization?.publicApp.client_name?.slice(0, 2).toUpperCase()}
                          {/if}
                        </Avatar.Fallback>
                      </Avatar.Root>
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{authorization.publicApp.client_name}</Item.Title>
                      <Item.Description>
                        Authorized on {format(new Date(authorization.consent.createdAt), "Pp", { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })} ({formatDistanceToNowStrict(new Date(authorization.consent.createdAt), { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })})
                      </Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          {#snippet child({ props })}
                            <Button {...props} variant="outline" size="icon-sm" aria-label="More Options">
                              <Ellipsis />
                            </Button>
                          {/snippet}
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Group>
                            <DropdownMenu.GroupHeading>{authorization.publicApp.client_name}</DropdownMenu.GroupHeading>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item onclick={() => (selectedAppForInfo = authorization.publicApp)}>View Details</DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item disabled class="text-destructive data-highlighted:text-destructive">Report</DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => (selectedAppForDeauth = { app: authorization.publicApp, consent: authorization.consent as OAuthConsent<Scope[]> })} class="text-destructive data-highlighted:text-destructive">Deauthorize</DropdownMenu.Item>
                          </DropdownMenu.Group>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Item.Actions>
                  </div>

                  <Collapsible.Root class="group/permissions w-full">
                    <Collapsible.Trigger class="w-full rounded-md border p-4">
                      <div class="flex w-full items-center justify-between">
                        Permissions
                        <ChevronRight class="inline-block size-5 text-muted-foreground transition-transform duration-150 ease-out group-data-[state=open]/permissions:rotate-90" />
                      </div>
                      <Collapsible.Content forceMount>
                        {#snippet child({ props, open })}
                          {#if open}
                            <div {...props} transition:slide={{ duration: 150, easing: cubicOut, axis: "y" }} class="mt-2">
                              {#each scopes as scope (scope.value)}
                                {@render scopeItem({ canAccess: authorization.consent.scopes.includes(scope.value), description: scope.consentDescription })}
                              {/each}
                            </div>
                          {:else}
                            <div class="mt-2 text-left text-sm text-muted-foreground">
                              {authorization.consent.scopes.filter((scope) => scopes.find((s) => s.value === scope)).length} permission{authorization.consent.scopes.filter((scope) => scopes.find((s) => s.value === scope)).length !== 1 ? "s" : ""} granted
                            </div>
                          {/if}
                        {/snippet}
                      </Collapsible.Content>
                    </Collapsible.Trigger>
                  </Collapsible.Root>
                </Item.Root>
              {/each}
            {/if}

            {#snippet pending()}
              <Spinner class="mx-auto" />
            {/snippet}

            {#snippet failed()}
              {@render empty({
                title: "Failed to load Authorized Applications",
                description: "There was an error loading your authorized applications. Please try again later.",
                Icon: SearchAlert
              })}
            {/snippet}
          </svelte:boundary>
        </div>
      </div>
    </div>
  </Card.Content>
</Card.Root>

{#snippet empty({ title, description, Icon }: { title: string; description: string; Icon: typeof IconType })}
  <Empty.Root>
    <Empty.Header>
      <Empty.Media variant="icon">
        <Icon />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
  </Empty.Root>
{/snippet}

{#snippet scopeItem({ canAccess, description }: { canAccess: boolean; description: string })}
  <Item.Root variant="default" size="sm" class={cn("px-0 py-1", { "opacity-50": !canAccess })}>
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

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content>
    {#if selectedAppForInfo}
      <Dialog.Header>
        <Dialog.Title>Details for {selectedAppForInfo.client_name}</Dialog.Title>
        <Dialog.Description class="space-y-4">
          <Avatar.Root bind:loadingStatus={loadingStatusDialog} class="pointer-events-none mx-auto size-16 rounded-none sm:size-24">
            <Avatar.Image src={getAvatar({ logoUri: selectedAppForInfo.logo_uri, clientId: selectedAppForInfo.client_id })} alt="App Avatar" class="size-full" />
            <Avatar.Fallback class="rounded-none">
              {#if selectedAppForInfo.logo_uri && loadingStatusDialog === "error"}
                <Avatar.Root class="pointer-events-none size-16 rounded-none sm:size-24">
                  <Avatar.Image src={getAvatar({ logoUri: selectedAppForInfo.logo_uri, clientId: selectedAppForInfo.client_id })} alt="App Avatar" class="size-full" />
                  <Avatar.Fallback class="rounded-none">{selectedAppForInfo.client_name?.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>
              {:else}
                {selectedAppForInfo.client_name?.slice(0, 2).toUpperCase()}
              {/if}
            </Avatar.Fallback>
          </Avatar.Root>

          {#if selectedAppForInfo.description || selectedAppForInfo.client_uri}
            <Item.Group class="rounded-lg border">
              {#if selectedAppForInfo.description}
                {@render additionalItem({
                  IconComponent: BookText,
                  description: selectedAppForInfo.description as string
                })}
              {/if}
              {#if selectedAppForInfo.client_uri}
                {@render additionalItem({ IconComponent: Info, description: `For more information about this app, please visit: <a href="${selectedAppForInfo.client_uri}" class="underline" target="_blank" rel="noopener noreferrer">${selectedAppForInfo.client_uri}</a>` })}
              {/if}
            </Item.Group>
          {/if}

          <Item.Group class="rounded-lg border">
            {@render additionalItem({
              IconComponent: Scale,
              description: `The developer of ${selectedAppForInfo.client_name}${selectedAppForInfo.client_name?.endsWith("s") ? "'" : "'s"} ${selectedAppForInfo.policy_uri ? `<a href="${selectedAppForInfo.policy_uri}" class="underline" target="_blank" rel="noopener noreferrer">privacy policy</a>` : "privacy policy"} and ${selectedAppForInfo.tos_uri ? `<a href="${selectedAppForInfo.tos_uri}" class="underline" target="_blank" rel="noopener noreferrer">terms of service</a>` : "terms of service"} apply to this application`
            })}
          </Item.Group>
        </Dialog.Description>
      </Dialog.Header>
    {:else}
      {@render empty({
        title: "No Application Selected",
        description: "Please select an application to view its details.",
        Icon: SearchAlert
      })}
    {/if}
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={alertDialogOpen}>
  <AlertDialog.Content>
    {#if selectedAppForDeauth}
      <AlertDialog.Header>
        <AlertDialog.Title>Deauthorize Application</AlertDialog.Title>
        <AlertDialog.Description>This action will remove the link between your MC-ID account and {selectedAppForDeauth.app.client_name}</AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action class="text-foreground">
          {#snippet child({ props })}
            <Button
              {...props}
              variant="destructive"
              onclick={() => {
                deauthorizing = true;
                toast.promise(
                  new Promise((resolve, reject) => {
                    deleteConsent(selectedAppForDeauth!.consent.id)
                      .then(resolve)
                      .catch(reject)
                      .finally(async () => {
                        selectedAppForDeauth = null;
                        deauthorizing = false;
                      });
                  }),
                  {
                    loading: "Deauthorizing application...",
                    success: "Application deauthorized successfully!",
                    error: "Failed to deauthorize application"
                  }
                );
              }}
              disabled={deauthorizing}
              aria-label="Deauthorize">
              {#if deauthorizing}
                <Spinner />
              {:else}
                Deauthorize
              {/if}
            </Button>
          {/snippet}
        </AlertDialog.Action>
      </AlertDialog.Footer>
    {:else}
      {@render empty({
        title: "No Application Selected",
        description: "Please select an application to deauthorize.",
        Icon: SearchAlert
      })}
    {/if}
  </AlertDialog.Content>
</AlertDialog.Root>
