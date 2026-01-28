<script lang="ts">
  import { resolve } from "$app/paths";
  import { DateTooltip } from "$components/data-table";
  import { authClient } from "$lib/auth-client";
  import { roles, type UserRole } from "$lib/roles";
  import * as AlertDialog from "$ui/alert-dialog";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as ButtonGroup from "$ui/button-group";
  import { Calendar } from "$ui/calendar";
  import * as Card from "$ui/card";
  import * as Empty from "$ui/empty";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import * as Item from "$ui/item";
  import { Label } from "$ui/label";
  import * as Popover from "$ui/popover";
  import * as Select from "$ui/select";
  import { Separator } from "$ui/separator";
  import { Spinner } from "$ui/spinner";
  import { Textarea } from "$ui/textarea";
  import { CalendarDate, getLocalTimeZone, now, today, type DateValue } from "@internationalized/date";
  import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
  import BadgeXIcon from "@lucide/svelte/icons/badge-x";
  import BanIcon from "@lucide/svelte/icons/ban";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import CircleArrowLeftIcon from "@lucide/svelte/icons/circle-arrow-left";
  import UserIcon from "@lucide/svelte/icons/user";
  import UserRoundXIcon from "@lucide/svelte/icons/user-round-x";
  import { parseDate } from "chrono-node";
  import { differenceInSeconds } from "date-fns";
  import { toast } from "svelte-sonner";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { rolesSnippet } from "../snippets.svelte";
  import type { PageProps } from "./$types";
  import { banFormSchema } from "./schema";

  const { data }: PageProps = $props();
  const { userDetails: user } = $derived(data);

  let toastLoading = $state<number | string>();
  let value = $derived<UserRole[]>(user?.role ? (user.role.split(",") as UserRole[]) : []);
  let calendarInputValue = $state("Never");
  let calendarValue = $state<DateValue | undefined>(undefined);
  let calendarOpen = $state(false);
  let banModalOpen = $state(false);

  const initialRoles = $derived(user?.role ? (user.role.split(",") as UserRole[]) : []);
  const canSaveRoles = $derived<boolean>(JSON.stringify(value.slice().sort()) !== JSON.stringify(initialRoles.slice().sort()));
  const selectContent = $derived<string[]>(roles.filter((role) => value.includes(role.value)).map((role) => role.label));
  const banDurationInSeconds = $derived.by<number>(() => {
    if (calendarValue) {
      // The number of seconds until the ban expires. If not provided, the ban will never expire.
      // This is not unix/epoch time, but rather the number of seconds from now.
      const nowDate = now(getLocalTimeZone()).toDate();
      const selectedDate = calendarValue.toDate(getLocalTimeZone());
      const diffInSeconds = differenceInSeconds(selectedDate, nowDate, {
        roundingMethod: "ceil"
      });
      return diffInSeconds > 0 ? diffInSeconds : 0;
    }
    return 0;
  });

  const form = $derived(
    superForm(data.banForm, {
      validators: zodClient(banFormSchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = $derived(form);

  function formatDate(date: DateValue | undefined) {
    if (!date) return "";

    return date.toDate(getLocalTimeZone()).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  $effect(() => {
    timeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to process your request...", {
          id: toastLoading
        });
      }
    });
  });
</script>

{#if user}
  <Card.Root class="mx-auto max-w-2xl">
    <Card.Header>
      <Card.Title class="flex items-center gap-2">User Details</Card.Title>
      <Card.Description>Detailed information about the user.</Card.Description>
    </Card.Header>
    <Card.Content>
      <Item.Root variant="outline">
        <Item.Header class="justify-start">
          {user.name}
          {#if user.banned}
            <Badge variant="destructive" class="flex items-center">
              <BanIcon class="size-4" />
              Banned
            </Badge>
          {/if}
        </Item.Header>
        <Item.Media variant="icon">
          <UserIcon />
        </Item.Media>
        <Item.Content class="gap-2">
          <Item.Title class="flex items-center">
            <span>
              {user.email}
            </span>
            <Badge variant="outline" class="flex items-center">
              {#if user.emailVerified}
                <BadgeCheckIcon class="size-4 text-primary" />
                Verified
              {:else}
                <BadgeXIcon class="size-4 text-destructive" />
                Unverified
              {/if}
            </Badge>
          </Item.Title>
          {#if user.role}
            <Item.Description class="flex flex-col flex-wrap gap-1">
              <div>
                {@render rolesSnippet({ roles: user.role.split(",") as UserRole[] })}
              </div>
              <Separator />
              <p>
                Created <DateTooltip date={user.createdAt} />
              </p>
              <p>
                Updated <DateTooltip date={user.updatedAt} />
              </p>
            </Item.Description>
          {/if}
          {#if user.banned && user.banReason != null}
            <Separator />
            <Item.Description class="flex flex-col flex-wrap gap-2">
              <div class="space-y-2">
                <Label for="banReason">Ban Reason</Label>
                <Textarea id="banReason" readonly value={user.banReason} />
              </div>
              {user.banExpires}
              {#if user.banExpires}
                <p>
                  Ban Expires <DateTooltip date={user.banExpires} />
                </p>
              {:else}
                <p>Ban Expires: Never</p>
              {/if}
            </Item.Description>
          {/if}
        </Item.Content>
      </Item.Root>
    </Card.Content>
    <Card.Footer class="flex flex-col items-start gap-1">
      <ButtonGroup.Root>
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="outline">Update roles</Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="space-y-2">
            <Label>Update Roles</Label>
            {#if selectContent.length === 0}
              <p class="text-muted-foreground">No roles selected</p>
            {:else}
              <div class="flex flex-row flex-wrap gap-1 rounded-md border p-2">
                {#each selectContent as role, i (i)}
                  <Badge variant="outline">{role}</Badge>
                {/each}
              </div>
            {/if}
            <ButtonGroup.Root>
              <Select.Root type="multiple" name="userRoles" bind:value>
                <Select.Trigger class="w-47">
                  <span class="text-left text-muted-foreground">Select roles</span>
                </Select.Trigger>
                <Select.Content>
                  {#each roles as role (role.value)}
                    <Select.Item value={role.value} disabled={role.value === "user"}>
                      {role.label}
                    </Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
              <Button
                disabled={!canSaveRoles}
                onclick={async () => {
                  toast.promise(
                    authClient.admin.setRole({
                      userId: user.id,
                      role: value
                    }),
                    {
                      loading: "Saving roles...",
                      success: "Roles updated successfully!",
                      error: "Failed to update roles."
                    }
                  );
                }}>
                Save
              </Button>
            </ButtonGroup.Root>
          </Popover.Content>
        </Popover.Root>

        {#if user.banned}
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              {#snippet child({ props })}
                <Button {...props} variant="destructive">Unban User</Button>
              {/snippet}
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                <AlertDialog.Description>
                  This action will unban the user <span class="font-semibold">{user.name}</span> and restore their access to their account.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action
                  onclick={() => {
                    toast.promise(
                      authClient.admin.unbanUser({
                        userId: user.id
                      }),
                      {
                        loading: "Unbanning user...",
                        success: () => {
                          setTimeout(() => location.reload(), 500);
                          return "User unbanned successfully!";
                        },
                        error: "Failed to unban user."
                      }
                    );
                  }}>
                  Continue
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog.Root>
        {:else}
          <AlertDialog.Root bind:open={banModalOpen}>
            <AlertDialog.Trigger>
              {#snippet child({ props })}
                <Button {...props} variant="destructive">Ban User</Button>
              {/snippet}
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <form
                method="POST"
                action="?/banUser"
                use:enhance={{
                  onSubmit: async () => {
                    $formData.userID = user.id;
                    $formData.duration = banDurationInSeconds;
                    toastLoading = toast.loading("Banning user...");
                  },
                  onResult: async () => {
                    setTimeout(() => toast.dismiss(toastLoading), 300);
                  },
                  onUpdate: async ({ result }) => {
                    if (result.type === "success") {
                      toast.success("User banned successfully!");
                      banModalOpen = false;
                    } else {
                      toast.error(result.data.error ?? "Failed to ban user. Please check your inputs.");
                    }
                  },
                  onError: async () => {
                    toast.error("Something went wrong while trying to ban the user.");
                  }
                }}
                class="contents">
                <AlertDialog.Header>
                  <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                  <AlertDialog.Description>
                    This action will ban the user <span class="font-semibold">{user.name}</span> from accessing their account.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <Form.Field {form} name="reason">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label for={props.name}>Reason</Form.Label>
                      <Form.Description>This is the reason for banning the user.</Form.Description>
                      <Textarea {...props} bind:value={$formData.reason} />
                      <Form.FieldErrors variant="single" />
                    {/snippet}
                  </Form.Control>
                </Form.Field>
                <Form.Field {form} name="duration">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label for={props.name}>Expiration</Form.Label>
                      <Form.Description>When should the ban expire?</Form.Description>
                      <div class="relative flex gap-2">
                        <Input
                          id={props.id}
                          bind:value={
                            () => calendarInputValue,
                            (v) => {
                              calendarInputValue = v;
                              const date = parseDate(v, undefined, { forwardDate: true });
                              if (date) {
                                calendarValue = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
                              } else {
                                calendarValue = undefined;
                              }
                            }
                          }
                          placeholder="Tomorrow, next week, never, etc."
                          class="bg-background pe-10"
                          onkeydown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              calendarOpen = true;
                            }
                          }} />
                        <!-- Hidden input to convert to number -->
                        <Input type="hidden" name={props.name} value={banDurationInSeconds} />
                        <Popover.Root bind:open={calendarOpen}>
                          <Popover.Trigger id="date-picker">
                            {#snippet child({ props })}
                              <Button {...props} variant="ghost" class="absolute end-2 top-1/2 size-6 -translate-y-1/2">
                                <CalendarIcon class="size-3.5" />
                                <span class="sr-only">Select date</span>
                              </Button>
                            {/snippet}
                          </Popover.Trigger>
                          <Popover.Content class="w-auto overflow-hidden p-0" align="end">
                            <Calendar
                              type="single"
                              bind:value={calendarValue}
                              captionLayout="dropdown"
                              isDateDisabled={(date) => date < today(getLocalTimeZone()).add({ days: 1 })}
                              onValueChange={(v) => {
                                calendarInputValue = formatDate(v);
                                calendarOpen = false;
                              }} />
                          </Popover.Content>
                        </Popover.Root>
                      </div>
                      <div class="px-1 text-sm text-muted-foreground">
                        {#if banDurationInSeconds === 0}
                          The ban will never expire.
                        {:else}
                          The ban will expire
                          <span class="font-medium">{formatDate(calendarValue)}</span>.
                        {/if}
                      </div>
                      <Form.FieldErrors variant="single" />
                    {/snippet}
                  </Form.Control>
                </Form.Field>

                <AlertDialog.Footer>
                  <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                  <AlertDialog.Action disabled={!isTainted($tainted) || $submitting} class="transition-all duration-300">
                    {#snippet child({ props })}
                      <Form.Button {...props}>
                        {#if !$submitting}
                          Confirm Ban
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
        {/if}
      </ButtonGroup.Root>
    </Card.Footer>
  </Card.Root>
{:else}
  <Empty.Root class="mx-auto w-full max-w-2xl border">
    <Empty.Header>
      <Empty.Media variant="icon">
        <UserRoundXIcon />
      </Empty.Media>
      <Empty.Title>User not found</Empty.Title>
      <Empty.Description>The user you are looking for does not exist.</Empty.Description>
    </Empty.Header>
    <Button href={resolve("/dashboard/admin/users")} variant="link" class="text-muted-foreground" size="sm">
      <CircleArrowLeftIcon class="size-4" />
      Go back
    </Button>
  </Empty.Root>
{/if}
