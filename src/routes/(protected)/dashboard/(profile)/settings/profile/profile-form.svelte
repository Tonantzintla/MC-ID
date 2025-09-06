<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { lastSynced } from "$stores/internal";
  import { Button, buttonVariants } from "$ui/button";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import * as Tooltip from "$ui/tooltip";
  import { tz } from "@date-fns/tz";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { formatDistanceStrict } from "date-fns";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { profileUpdateSchema, type ProfileUpdateSchema } from "./schema";
  import { serverDate, syncUser } from "./sync.remote";

  const { data }: { data: { profileUpdateForm: SuperValidated<Infer<ProfileUpdateSchema>> } } = $props();

  const form = superForm(data.profileUpdateForm, {
    validators: zodClient(profileUpdateSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "oninput",
    resetForm: false
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = form;

  const serverDateResult = $derived(await serverDate());
  let syncDisabled = $derived($lastSynced && new Date(serverDateResult.data).getTime() - $lastSynced.getTime() < 3 * 24 * 60 * 60 * 1000);
  let username = $state<string>(page.data.user.name ?? $formData.name);
  let toastLoading = $state<number | string>();
  let syncingUser = $state<boolean>(false);

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to update your profile...", {
        id: toastLoading
      });
    }
  });
</script>

<form
  method="POST"
  action="?/updateEmail"
  use:enhance={{
    onSubmit: async () => {
      toastLoading = toast.loading("Updating your email...");
    },
    onResult: async () => {
      setTimeout(() => toast.dismiss(toastLoading), 300);
    },
    onUpdate: async ({ result }) => {
      if (result.type === "success") {
        toast.success("Updated your email successfully!");
      } else {
        toast.error(result.data.error ?? "Failed to update your email.");
      }
    },
    onError: async () => {
      toast.error("Something went wrong while trying to update your email.");
    }
  }}
  class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  <div class="space-y-2">
    <Label for="username">Minecraft account</Label>
    <div class="text-sm text-muted-foreground">You can edit your Minecraft account on <Button href="https://www.minecraft.net/profile" target="_blank" variant="link" class="inline h-auto p-0">minecraft.net</Button>.</div>
    <div class="flex gap-4">
      <Input value={username} disabled readonly maxlength={16} type="text" autocomplete="username" />
      {#if syncDisabled}
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <div {...props} class={cn("cursor-not-allowed opacity-50 hover:bg-secondary!", buttonVariants({ variant: "secondary", size: "default" }))}>
                <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 data-[syncing=true]:animate-spin" data-syncing={syncingUser} />
                Sync
              </div>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>
            You can sync again
            {formatDistanceStrict(new Date(new Date(serverDateResult.data).getTime() + 3 * 24 * 60 * 60 * 1000), $lastSynced, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}
          </Tooltip.Content>
        </Tooltip.Root>
      {:else}
        <Button
          class="group"
          variant="secondary"
          type="button"
          disabled={syncingUser || $submitting}
          onclick={() => {
            if (syncDisabled) return;
            syncingUser = true;
            toast.promise(
              new Promise((resolve, reject) => {
                syncUser(page.data.user.id ?? $formData.uuid)
                  .then(({ data, success, message }) => {
                    if (!success) throw new Error(message ?? "Failed to sync user.");
                    username = data.name;
                    lastSynced.set(new Date(serverDateResult.data));
                    resolve(data);
                  })
                  .catch(reject)
                  .finally(() => {
                    syncingUser = false;
                  });
              }),
              {
                loading: "Syncing...",
                success: "Synced successfully!",
                error: "Something went wrong while syncing.",
                duration: 3000,
                onDismiss: () => {
                  toast.info("Your username has been synced with your Minecraft account.", {
                    description: "Please wait a few minutes for the skin to update if it has changed.",
                    duration: 5000
                  });
                }
              }
            );
          }}>
          <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 data-[syncing=true]:animate-spin" data-syncing={syncingUser} />
          Sync
        </Button>
      {/if}
    </div>
  </div>
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Email</Form.Label>
        <Form.Description>This is only used for password recovery.</Form.Description>
        <Input {...props} bind:value={$formData.email} type="email" autocomplete="email" />
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Button disabled={!isTainted($tainted) || $submitting || syncingUser} class="transition-all duration-300" variant={!isTainted($tainted) ? "secondary" : "default"}>
    {#if !$submitting}
      Update Profile
    {:else}
      <LoaderCircle class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
