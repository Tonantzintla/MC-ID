<script lang="ts">
  import { resolve } from "$app/paths";
  import DateTooltip from "$components/data-table/date-tooltip.svelte";
  import * as AlertDialog from "$ui/alert-dialog";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as ButtonGroup from "$ui/button-group";
  import * as Card from "$ui/card";
  import * as Empty from "$ui/empty";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import * as Item from "$ui/item";
  import { Spinner } from "$ui/spinner";
  import { Switch } from "$ui/switch";
  import BanIcon from "@lucide/svelte/icons/ban";
  import CircleArrowLeftIcon from "@lucide/svelte/icons/circle-arrow-left";
  import KeyIcon from "@lucide/svelte/icons/key";
  import { formatDuration, intervalToDuration } from "date-fns";
  import { toast } from "svelte-sonner";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { PageProps } from "./$types";
  import { deleteKeySchema, updateKeySchema } from "./schema";

  const { data }: PageProps = $props();
  const { apiKey } = $derived(data);

  let toastLoading = $state<number | string>();
  let updateModalOpen = $state<boolean>(false);
  let deleteModalOpen = $state<boolean>(false);

  const updateKeyForm = $derived(
    superForm(data.updateKeyForm, {
      validators: zodClient(updateKeySchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const deleteKeyForm = $derived(
    superForm(data.deleteKeyForm, {
      validators: zodClient(deleteKeySchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const { form: updateKeyFormData, enhance: updateKeyEnhance, tainted: updateKeyTainted, isTainted: updateKeyIsTainted, submitting: updateKeySubmitting, timeout: updateKeyTimeout } = $derived(updateKeyForm);
  const { form: deleteKeyFormData, enhance: deleteKeyEnhance, submitting: deleteKeySubmitting, timeout: deleteKeyTimeout } = $derived(deleteKeyForm);

  $effect(() => {
    updateKeyTimeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to process your request...", {
          id: toastLoading
        });
      }
    });

    deleteKeyTimeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to process your request...", {
          id: toastLoading
        });
      }
    });
  });
</script>

{#if apiKey}
  <Card.Root class="mx-auto max-w-2xl">
    <Card.Header>
      <Card.Title class="flex items-center gap-2">API Key Details</Card.Title>
      <Card.Description>Detailed information about the API key.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <Item.Root variant="outline">
        <Item.Header class="justify-start">Owner</Item.Header>
        <Item.Media variant="image" class="rounded-none">
          <Avatar.Root class="size-10 rounded-none">
            <Avatar.Image src={`https://nmsr.nickac.dev/face/${apiKey.minecraftAccount.uuid}`} alt={apiKey.minecraftAccount.username} />
            <Avatar.Fallback>
              {apiKey.minecraftAccount.username.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        </Item.Media>
        <Item.Content class="gap-2">
          <Item.Title class="flex items-center">
            {apiKey.minecraftAccount.username}
          </Item.Title>

          <Item.Description class="flex flex-col flex-wrap gap-1">
            <p>
              Created <DateTooltip date={apiKey.minecraftAccount.createdAt} />
            </p>
            <p>
              Updated <DateTooltip date={apiKey.minecraftAccount.updatedAt} />
            </p>
            <Button variant="outline" href={resolve("/(protected)/dashboard/(admin)/admin/users/[userID]", { userID: apiKey.minecraftAccount.userId })}>Show User</Button>
          </Item.Description>
        </Item.Content>
      </Item.Root>
      <Item.Root variant="outline">
        <Item.Header class="justify-start">
          {apiKey.name}
          {#if !apiKey.enabled}
            <Badge variant="destructive" class="flex items-center">
              <BanIcon class="size-4" />
              Disabled
            </Badge>
          {/if}
        </Item.Header>
        <Item.Media variant="icon">
          <KeyIcon />
        </Item.Media>
        <Item.Content class="gap-2">
          <Item.Description class="flex flex-col flex-wrap gap-1">
            <p>
              Created <DateTooltip date={apiKey.createdAt} />
            </p>
            <p>
              Updated <DateTooltip date={apiKey.updatedAt} />
            </p>
          </Item.Description>
        </Item.Content>
      </Item.Root>
    </Card.Content>
    <Card.Footer class="flex flex-col items-start gap-1">
      <ButtonGroup.Root>
        <AlertDialog.Root bind:open={updateModalOpen}>
          <AlertDialog.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="default">Update Key</Button>
            {/snippet}
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <form
              method="POST"
              action="?/updateKey"
              use:updateKeyEnhance={{
                onSubmit: async () => {
                  $updateKeyFormData.apiKeyID = apiKey.id;
                  toastLoading = toast.loading("Updating Key...");
                },
                onResult: async () => {
                  setTimeout(() => toast.dismiss(toastLoading), 300);
                },
                onUpdate: async ({ result }) => {
                  if (result.type === "success") {
                    toast.success("Key updated successfully!");
                    updateModalOpen = false;
                  } else {
                    toast.error(result.data.error ?? "Failed to update key. Please check your inputs.");
                  }
                },
                onError: async () => {
                  toast.error("Something went wrong while trying to update the key.");
                }
              }}
              class="contents">
              <AlertDialog.Header>
                <AlertDialog.Title>Update API Key</AlertDialog.Title>
                <AlertDialog.Description>
                  This action will update the key <span class="font-semibold">{apiKey.name}</span>.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <Form.Field form={updateKeyForm} name="enabled">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label for={props.name}>Enabled</Form.Label>
                    <Form.Description>Toggle whether the API key is enabled or disabled.</Form.Description>
                    {#if $updateKeyFormData.enabled != null}
                      <Switch {...props} bind:checked={$updateKeyFormData.enabled} />
                    {/if}
                    <Form.FieldErrors variant="single" />
                  {/snippet}
                </Form.Control>
              </Form.Field>

              <Form.Field form={updateKeyForm} name="rateLimitEnabled">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label for={props.name}>Enable Rate Limit</Form.Label>
                    <Form.Description>Toggle whether the rate limit for this API key is enabled.</Form.Description>
                    {#if $updateKeyFormData.rateLimitEnabled != null}
                      <Switch {...props} bind:checked={$updateKeyFormData.rateLimitEnabled} />
                    {/if}
                    <Form.FieldErrors variant="single" />
                  {/snippet}
                </Form.Control>
              </Form.Field>

              <Form.Field form={updateKeyForm} name="rateLimitTimeWindow">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label for={props.name}>Rate Limit Time Window</Form.Label>
                    <Form.Description>Set the time window in ms for the rate limit of this API key. Check <Button href="https://www.better-auth.com/docs/plugins/api-key#update-an-api-key" variant="link" class="inline h-auto p-0 break-all">the Better Auth documentation</Button> for more information about rate limits.</Form.Description>
                    <Input
                      {...props}
                      bind:value={
                        () => $updateKeyFormData.rateLimitTimeWindow,
                        (v) => {
                          if (isNaN(Number(v))) {
                            $updateKeyFormData.rateLimitTimeWindow = 0;
                            return;
                          }
                          $updateKeyFormData.rateLimitTimeWindow = Number(v);
                        }
                      } />
                    <p>
                      {$updateKeyFormData.rateLimitTimeWindow} ms is {formatDuration(intervalToDuration({ start: 0, end: Number($updateKeyFormData.rateLimitTimeWindow) || 0 }), { format: ["hours", "minutes", "seconds"] })}.
                    </p>
                    <Form.FieldErrors variant="single" />
                  {/snippet}
                </Form.Control>
              </Form.Field>

              <Form.Field form={updateKeyForm} name="rateLimitMax">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label for={props.name}>Rate Limit Max</Form.Label>
                    <Form.Description>
                      Set the maximum number of requests allowed within the time window for this API key. Check <Button href="https://www.better-auth.com/docs/plugins/api-key#update-an-api-key" variant="link" class="inline h-auto p-0 break-all">the Better Auth documentation</Button> for more information about rate limits.</Form.Description>
                    <Input
                      {...props}
                      bind:value={
                        () => $updateKeyFormData.rateLimitMax,
                        (v) => {
                          if (isNaN(Number(v))) {
                            $updateKeyFormData.rateLimitMax = 0;
                            return;
                          }
                          $updateKeyFormData.rateLimitMax = Number(v);
                        }
                      } />
                    <Form.FieldErrors variant="single" />
                  {/snippet}
                </Form.Control>
              </Form.Field>
              <AlertDialog.Footer>
                <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                <AlertDialog.Action disabled={!updateKeyIsTainted($updateKeyTainted) || $updateKeySubmitting} class="transition-all duration-300">
                  {#snippet child({ props })}
                    <Form.Button {...props}>
                      {#if !$updateKeySubmitting}
                        Confirm Update
                      {:else}
                        <Spinner />
                      {/if}
                    </Form.Button>
                  {/snippet}
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Root>
        <AlertDialog.Root bind:open={deleteModalOpen}>
          <AlertDialog.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="destructive">Delete Key</Button>
            {/snippet}
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <form
              method="POST"
              action="?/deleteKey"
              use:deleteKeyEnhance={{
                onSubmit: async () => {
                  $deleteKeyFormData.apiKeyID = apiKey.id;
                  toastLoading = toast.loading("Deleting Key...");
                },
                onResult: async () => {
                  setTimeout(() => toast.dismiss(toastLoading), 300);
                },
                onUpdate: async ({ result }) => {
                  if (result.type === "success") {
                    toast.success("Key deleted successfully!");
                    deleteModalOpen = false;
                  } else {
                    toast.error(result.data.error ?? "Failed to delete key. Please check your inputs.");
                  }
                },
                onError: async () => {
                  toast.error("Something went wrong while trying to delete the key.");
                }
              }}
              class="contents">
              <AlertDialog.Header>
                <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                <AlertDialog.Description>
                  This action cannot be undone. This will permanently delete the key <span class="font-semibold">{apiKey.name}</span>.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                <AlertDialog.Action disabled={$deleteKeySubmitting} class="transition-all duration-300">
                  {#snippet child({ props })}
                    <Form.Button {...props}>
                      {#if !$deleteKeySubmitting}
                        Confirm Delete
                      {:else}
                        <Spinner />
                      {/if}
                    </Form.Button>
                  {/snippet}
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </ButtonGroup.Root>
    </Card.Footer>
  </Card.Root>
{:else}
  <Empty.Root class="mx-auto w-full max-w-2xl border">
    <Empty.Header>
      <Empty.Media variant="icon">
        <KeyIcon />
      </Empty.Media>
      <Empty.Title>API key not found</Empty.Title>
      <Empty.Description>The API key you are looking for does not exist.</Empty.Description>
    </Empty.Header>
    <Button href={resolve("/dashboard/admin/api-keys")} variant="link" class="text-muted-foreground" size="sm">
      <CircleArrowLeftIcon class="size-4" />
      Go back
    </Button>
  </Empty.Root>
{/if}
