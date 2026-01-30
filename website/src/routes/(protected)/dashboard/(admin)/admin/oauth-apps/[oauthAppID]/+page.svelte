<script lang="ts">
  import { resolve } from "$app/paths";
  import { DateTooltip } from "$components/data-table";
  import MinecraftUser from "$components/data-table/minecraft-user.svelte";
  import OauthAppAvatar from "$components/oauth-app-avatar.svelte";
  import { REPORT_STATUSES } from "$lib/shared/enums/reportEnums";
  import * as AlertDialog from "$ui/alert-dialog";
  import * as Avatar from "$ui/avatar";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as ButtonGroup from "$ui/button-group";
  import * as Card from "$ui/card";
  import * as Collapsible from "$ui/collapsible";
  import * as Empty from "$ui/empty";
  import * as Form from "$ui/form";
  import * as Item from "$ui/item";
  import { ScrollArea } from "$ui/scroll-area";
  import * as Select from "$ui/select";
  import { Separator } from "$ui/separator";
  import { Spinner } from "$ui/spinner";
  import { Switch } from "$ui/switch";
  import { Textarea } from "$ui/textarea";
  import BanIcon from "@lucide/svelte/icons/ban";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import CircleArrowLeftIcon from "@lucide/svelte/icons/circle-arrow-left";
  import CodeXmlIcon from "@lucide/svelte/icons/code-xml";
  import SearchXIcon from "@lucide/svelte/icons/search-x";
  import { toast } from "svelte-sonner";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { PageProps } from "./$types";
  import { deleteOauthAppSchema, handleReportSchema, updateOauthAppSchema } from "./schema";

  const { data }: PageProps = $props();
  const { oauthApp } = $derived(data);

  let toastLoading = $state<number | string>();
  let updateModalOpen = $state<boolean>(false);
  let deleteModalOpen = $state<boolean>(false);
  let handleReportModalOpen = $state<boolean>(false);

  const updateOauthAppForm = $derived(
    superForm(data.updateOauthAppForm, {
      validators: zodClient(updateOauthAppSchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const deleteOauthAppForm = $derived(
    superForm(data.deleteOauthAppForm, {
      validators: zodClient(deleteOauthAppSchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const handleReportForm = $derived(
    superForm(data.handleReportForm, {
      validators: zodClient(handleReportSchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const { form: updateOauthAppFormData, enhance: updateOauthAppEnhance, tainted: updateOauthAppTainted, isTainted: updateOauthAppIsTainted, submitting: updateOauthAppSubmitting, timeout: updateOauthAppTimeout } = $derived(updateOauthAppForm);
  const { form: deleteOauthAppFormData, enhance: deleteOauthAppEnhance, submitting: deleteOauthAppSubmitting, timeout: deleteOauthAppTimeout } = $derived(deleteOauthAppForm);
  const { form: handleReportFormData, enhance: handleReportEnhance, tainted: handleReportTainted, isTainted: handleReportIsTainted, submitting: handleReportSubmitting, timeout: handleReportTimeout } = $derived(handleReportForm);

  $effect(() => {
    updateOauthAppTimeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to process your request...", {
          id: toastLoading
        });
      }
    });

    deleteOauthAppTimeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to process your request...", {
          id: toastLoading
        });
      }
    });

    handleReportTimeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to process your request...", {
          id: toastLoading
        });
      }
    });
  });
</script>

{#if oauthApp}
  <Card.Root class="mx-auto w-full max-w-2xl">
    <Card.Header>
      <Card.Title class="flex items-center gap-2">OAuth App Details</Card.Title>
      <Card.Description>Detailed information about the OAuth app.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <Item.Root variant="outline">
        <Item.Header class="justify-start">Owner</Item.Header>
        <Item.Media variant="image" class="rounded-none">
          <Avatar.Root class="size-10 rounded-none">
            <Avatar.Image src={`https://nmsr.nickac.dev/face/${oauthApp.minecraftAccount?.uuid}`} alt={oauthApp.minecraftAccount?.username} />
            <Avatar.Fallback>
              {oauthApp.minecraftAccount?.username.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        </Item.Media>
        <Item.Content class="gap-2">
          <Item.Title class="flex items-center">
            {oauthApp.minecraftAccount?.username}
          </Item.Title>

          {#if oauthApp.minecraftAccount?.createdAt || oauthApp.minecraftAccount?.updatedAt || oauthApp.minecraftAccount?.userId}
            <Item.Description class="flex flex-col flex-wrap gap-1">
              {#if oauthApp.minecraftAccount?.createdAt}
                <p>
                  Created <DateTooltip date={oauthApp.minecraftAccount?.createdAt} />
                </p>
              {/if}
              {#if oauthApp.minecraftAccount?.updatedAt}
                <p>
                  Updated <DateTooltip date={oauthApp.minecraftAccount?.updatedAt} />
                </p>
              {/if}
              {#if oauthApp.minecraftAccount?.userId}
                <Button variant="outline" href={resolve("/(protected)/dashboard/(admin)/admin/users/[userID]", { userID: oauthApp.minecraftAccount?.userId })}>Show User</Button>
              {/if}
            </Item.Description>
          {/if}
        </Item.Content>
      </Item.Root>
      <Item.Root variant="outline">
        <Item.Header class="justify-start">
          {oauthApp.name}
          {#if oauthApp.disabled}
            <Badge variant="destructive" class="flex items-center">
              <BanIcon class="size-4" />
              Disabled
            </Badge>
          {/if}
        </Item.Header>
        <Item.Media variant="image" class="rounded-none">
          <OauthAppAvatar client_id={oauthApp.clientId} client_name={oauthApp.name} logo_uri={oauthApp.icon} class="pointer-events-none size-10 rounded-none" />
        </Item.Media>
        {#if oauthApp.createdAt || oauthApp.updatedAt}
          <Item.Content class="gap-2">
            <Item.Description class="flex flex-col flex-wrap gap-1">
              {#if oauthApp.createdAt}
                <p>
                  Created <DateTooltip date={oauthApp.createdAt} />
                </p>
              {/if}
              {#if oauthApp.updatedAt}
                <p>
                  Updated <DateTooltip date={oauthApp.updatedAt} />
                </p>
              {/if}
            </Item.Description>
          </Item.Content>
        {/if}
      </Item.Root>

      <!-- Lazily show every property -->
      <ScrollArea class="h-72 rounded-md border px-4">
        {#each Object.entries(oauthApp) as [key, value], index (index)}
          {#if !["id", "clientId", "name", "icon", "disabled", "createdAt", "updatedAt", "minecraftAccount", "oauthClientReports"].includes(key)}
            <Collapsible.Root class="group/data my-4 w-full">
              <Collapsible.Trigger class="w-full rounded-md border p-4 text-left transition-all duration-150 ease-out group-data-[state=open]/data:rounded-b-none group-data-[state=open]/data:border-b-transparent">
                <div class="flex w-full items-center justify-between">
                  {key}
                  <ChevronRightIcon class="inline-block size-5 text-muted-foreground transition-transform duration-150 ease-out group-data-[state=open]/data:rotate-90" />
                </div>
              </Collapsible.Trigger>
              <Collapsible.Content forceMount class="-mt-px rounded-b-md border border-t-0 p-4">
                {#snippet child({ props, open })}
                  {#if open}
                    <div {...props} transition:slide={{ duration: 150, easing: cubicOut, axis: "y" }}>
                      {#if Array.isArray(value)}
                        {#each value as item, idx (idx)}
                          <pre>{JSON.stringify(item, null, 2)}</pre>
                        {/each}
                      {:else if typeof value === "object" && value !== null}
                        <pre>{JSON.stringify(value, null, 2)}</pre>
                      {:else}
                        {String(value)}
                      {/if}
                    </div>
                  {/if}
                {/snippet}
              </Collapsible.Content>
            </Collapsible.Root>
          {/if}
        {/each}
      </ScrollArea>
    </Card.Content>
    <Card.Footer class="flex flex-col items-start gap-1">
      <ButtonGroup.Root>
        <AlertDialog.Root bind:open={updateModalOpen}>
          <AlertDialog.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="default">Update OAuth App</Button>
            {/snippet}
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <form
              method="POST"
              action="?/updateOauthApp"
              use:updateOauthAppEnhance={{
                onSubmit: async () => {
                  $updateOauthAppFormData.oauthAppID = oauthApp.id;
                  toastLoading = toast.loading("Updating OAuth App...");
                },
                onResult: async () => {
                  setTimeout(() => toast.dismiss(toastLoading), 300);
                },
                onUpdate: async ({ result }) => {
                  if (result.type === "success") {
                    toast.success("OAuth App updated successfully!");
                    updateModalOpen = false;
                  } else {
                    toast.error(result.data.error ?? "Failed to update OAuth App. Please check your inputs.");
                  }
                },
                onError: async () => {
                  toast.error("Something went wrong while trying to update the OAuth App.");
                }
              }}
              class="contents">
              <AlertDialog.Header>
                <AlertDialog.Title>Update OAuth App</AlertDialog.Title>
                <AlertDialog.Description>
                  This action will update the OAuth App <span class="font-semibold">{oauthApp.name}</span>.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <Form.Field form={updateOauthAppForm} name="disabled">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label for={props.name}>Enabled</Form.Label>
                    <Form.Description>Toggle whether the OAuth App is enabled or disabled.</Form.Description>
                    {#if $updateOauthAppFormData.disabled != null}
                      <Switch
                        {...props}
                        bind:checked={
                          () => !$updateOauthAppFormData.disabled,
                          (v) => {
                            $updateOauthAppFormData.disabled = !v;
                          }
                        } />
                    {/if}
                    <Form.FieldErrors variant="single" />
                  {/snippet}
                </Form.Control>
              </Form.Field>
              <AlertDialog.Footer>
                <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                <AlertDialog.Action disabled={!updateOauthAppIsTainted($updateOauthAppTainted) || $updateOauthAppSubmitting} class="transition-all duration-300">
                  {#snippet child({ props })}
                    <Form.Button {...props}>
                      {#if !$updateOauthAppSubmitting}
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
              <Button {...props} variant="destructive">Delete OAuth App</Button>
            {/snippet}
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <form
              method="POST"
              action="?/deleteOauthApp"
              use:deleteOauthAppEnhance={{
                onSubmit: async () => {
                  $deleteOauthAppFormData.oauthAppID = oauthApp.id;
                  toastLoading = toast.loading("Deleting OAuth App...");
                },
                onResult: async () => {
                  setTimeout(() => toast.dismiss(toastLoading), 300);
                },
                onUpdate: async ({ result }) => {
                  if (result.type === "success") {
                    toast.success("OAuth App deleted successfully!");
                    deleteModalOpen = false;
                  } else {
                    toast.error(result.data.error ?? "Failed to delete OAuth App. Please check your inputs.");
                  }
                },
                onError: async () => {
                  toast.error("Something went wrong while trying to delete the OAuth App.");
                }
              }}
              class="contents">
              <AlertDialog.Header>
                <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                <AlertDialog.Description>
                  This action cannot be undone. This will permanently delete the OAuth App <span class="font-semibold">{oauthApp.name}</span>.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                <AlertDialog.Action disabled={$deleteOauthAppSubmitting} class="transition-all duration-300">
                  {#snippet child({ props })}
                    <Form.Button {...props}>
                      {#if !$deleteOauthAppSubmitting}
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

  <Card.Root class="mx-auto mt-8 w-full max-w-2xl">
    <Card.Header>
      <Card.Title>Reports</Card.Title>
      <Card.Description>User made reports against this OAuth App.</Card.Description>
    </Card.Header>
    <Card.Content>
      <ScrollArea class="h-200 rounded-md border p-4">
        {#if oauthApp.oauthClientReports.length > 0}
          {#each oauthApp.oauthClientReports as report (report.id)}
            <Collapsible.Root class="group/data my-4 w-full">
              <Collapsible.Trigger class="w-full rounded-md border px-4 pt-4 text-left transition-all duration-150 ease-out group-data-[state=open]/data:rounded-b-none group-data-[state=open]/data:border-b-transparent">
                <div class="flex w-full items-center justify-between">
                  <div class="flex flex-col">
                    <span>
                      Report ID: {report.id},
                    </span>
                    <span class="flex items-center">
                      Reporter: {#if report.reporter.minecraftAccounts[0]}
                        <MinecraftUser minecraftAccount={report.reporter.minecraftAccounts[0]} />
                      {:else}
                        Unknown User
                      {/if}
                    </span>
                    <span class="capitalize">
                      Reason: <Badge variant="outline">{report.reason}</Badge>
                    </span>
                    <span class="capitalize">
                      Status: <Badge variant={report.status === "resolved" || report.status === "dismissed" ? "default" : report.status === "under_review" ? "secondary" : report.status === "pending" ? "outline" : "default"}>{report.status}</Badge>
                    </span>
                    <span>
                      Created <DateTooltip date={report.createdAt} />
                    </span>
                  </div>
                  <ChevronRightIcon class="inline-block size-5 text-muted-foreground transition-transform duration-150 ease-out group-data-[state=open]/data:rotate-90" />
                </div>
              </Collapsible.Trigger>
              <Collapsible.Content forceMount class="-mt-px rounded-b-md border border-t-0 px-4 pb-4">
                {#snippet child({ props, open })}
                  {#if open}
                    <div {...props} transition:slide={{ duration: 150, easing: cubicOut, axis: "y" }}>
                      <div class="py-4">
                        <Separator />
                      </div>
                      <div class="flex items-center gap-1">
                        <strong>Description:</strong>
                        {report.description}
                      </div>
                      {#if report.createdAt}
                        <div class="flex items-center gap-1">
                          <strong>Created:</strong>
                          <DateTooltip date={report.createdAt} />
                        </div>
                      {/if}
                      {#if report.updatedAt}
                        <div class="flex items-center gap-1">
                          <strong>Updated:</strong>
                          <DateTooltip date={report.updatedAt} />
                        </div>
                      {/if}
                      {#if report.resolvedAt || report.resolutionNote || report.resolvedBy}
                        <div class="py-4">
                          <Separator />
                        </div>
                        {#if report.resolvedAt}
                          <div class="flex items-center gap-1">
                            <strong>Resolved:</strong>
                            <DateTooltip date={report.resolvedAt} />
                          </div>
                        {/if}
                        {#if report.resolutionNote}
                          <div class="flex items-center gap-1">
                            <strong>Resolution Note:</strong>
                            {report.resolutionNote}
                          </div>
                        {/if}
                        <div class="flex items-center gap-1">
                          <strong>Resolved By:</strong>
                          {#if report.resolvedBy?.minecraftAccounts[0]}
                            <MinecraftUser minecraftAccount={report.resolvedBy.minecraftAccounts[0]} />
                          {:else}
                            Unknown User
                          {/if}
                        </div>
                      {/if}
                      <AlertDialog.Root bind:open={handleReportModalOpen}>
                        <AlertDialog.Trigger>
                          {#snippet child({ props })}
                            <Button {...props} variant="default">Handle Report</Button>
                          {/snippet}
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <form
                            method="POST"
                            action="?/handleReport"
                            use:handleReportEnhance={{
                              onSubmit: async () => {
                                $handleReportFormData.oauthAppID = oauthApp.clientId;
                                $handleReportFormData.reportID = report.id;

                                toastLoading = toast.loading("Handling report...");
                              },
                              onResult: async () => {
                                setTimeout(() => toast.dismiss(toastLoading), 300);
                              },
                              onUpdate: async ({ result }) => {
                                if (result.type === "success") {
                                  toast.success("Report handled successfully!");
                                  handleReportModalOpen = false;
                                } else {
                                  toast.error(result.data.error ?? "Failed to update the report. Please check your inputs.");
                                }
                              },
                              onError: async () => {
                                toast.error("Something went wrong while trying to handle the report.");
                              }
                            }}
                            class="contents">
                            <AlertDialog.Header>
                              <AlertDialog.Title>Handle Report</AlertDialog.Title>
                              <AlertDialog.Description>
                                This action will update the report <span class="font-semibold">{report.id}</span> for <span class="font-semibold">{oauthApp.name}</span>.
                              </AlertDialog.Description>
                            </AlertDialog.Header>
                            <Form.Field form={handleReportForm} name="status">
                              <Form.Control>
                                {#snippet children({ props })}
                                  <Form.Label for={props.name}>Status</Form.Label>
                                  <Form.Description>Select the new status for this report.</Form.Description>
                                  <Select.Root type="single" bind:value={$handleReportFormData.status}>
                                    <Select.Trigger class="w-45 capitalize">
                                      {$handleReportFormData.status.replace("_", " ") || "Select status"}
                                    </Select.Trigger>
                                    <Select.Content class="capitalize">
                                      {#each REPORT_STATUSES as reportStatus, idx (idx)}
                                        {@const label = reportStatus.replace("_", " ")}
                                        <Select.Item value={reportStatus} {label} disabled={reportStatus === $handleReportFormData.status}>
                                          {label}
                                        </Select.Item>
                                      {/each}
                                    </Select.Content>
                                  </Select.Root>
                                  <Form.FieldErrors variant="single" />
                                {/snippet}
                              </Form.Control>
                            </Form.Field>
                            <Form.Field form={handleReportForm} name="resolutionNote">
                              <Form.Control>
                                {#snippet children({ props })}
                                  <Form.Label for={props.name}>Resolution Note</Form.Label>
                                  <Form.Description>Provide a resolution note for this report.</Form.Description>
                                  <Textarea {...props} bind:value={$handleReportFormData.resolutionNote} />
                                  <Form.FieldErrors variant="single" />
                                {/snippet}
                              </Form.Control>
                            </Form.Field>
                            <AlertDialog.Footer>
                              <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                              <AlertDialog.Action disabled={!handleReportIsTainted($handleReportTainted) || $handleReportSubmitting} class="transition-all duration-300">
                                {#snippet child({ props })}
                                  <Form.Button {...props}>
                                    {#if !$handleReportSubmitting}
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
                    </div>
                  {/if}
                {/snippet}
              </Collapsible.Content>
            </Collapsible.Root>
          {/each}
        {:else}
          <Empty.Root class="mx-auto w-full max-w-2xl border">
            <Empty.Header>
              <Empty.Media variant="icon">
                <SearchXIcon />
              </Empty.Media>
              <Empty.Title>Reports not found</Empty.Title>
              <Empty.Description>No reports found for this OAuth App.</Empty.Description>
            </Empty.Header>
          </Empty.Root>
        {/if}
      </ScrollArea>
    </Card.Content>
  </Card.Root>
{:else}
  <Empty.Root class="mx-auto w-full max-w-2xl border">
    <Empty.Header>
      <Empty.Media variant="icon">
        <CodeXmlIcon />
      </Empty.Media>
      <Empty.Title>OAuth App not found</Empty.Title>
      <Empty.Description>The OAuth App you are looking for does not exist.</Empty.Description>
    </Empty.Header>
    <Button href={resolve("/dashboard/admin/oauth-apps")} variant="link" class="text-muted-foreground" size="sm">
      <CircleArrowLeftIcon class="size-4" />
      Go back
    </Button>
  </Empty.Root>
{/if}
