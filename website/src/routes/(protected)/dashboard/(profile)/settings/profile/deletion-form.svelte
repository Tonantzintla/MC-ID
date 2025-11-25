<script lang="ts">
  import * as Password from "$ui/extras/password";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { toast } from "svelte-sonner";
  import { slide } from "svelte/transition";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { accountDeletionSchema, type AccountDeletionSchema } from "./schema";

  const { data }: { data: { accountDeletionForm: SuperValidated<Infer<AccountDeletionSchema>> } } = $props();

  const form = superForm(data.accountDeletionForm, {
    validators: zodClient(accountDeletionSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "onblur"
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout, errors } = form;

  let toastLoading = $state<number | string>();

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to delete your account...", {
        id: toastLoading
      });
    }
  });
</script>

<form
  method="POST"
  action="?/deleteAccount"
  use:enhance={{
    onSubmit: async () => {
      toastLoading = toast.loading("Deleting your account...");
    },
    onResult: async () => {
      setTimeout(() => toast.dismiss(toastLoading), 300);
    },
    onUpdate: async ({ result }) => {
      if (result.type === "success") {
        toast.success("Account deleted successfully! You will be logged out.");
      } else {
        toast.error(result.data.error ?? "Failed to delete account.");
      }
    },
    onError: async () => {
      toast.error("Something went wrong while trying to delete your account.");
    }
  }}
  class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  <Form.Field {form} name="current-password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Current Password</Form.Label>
        <Form.Description>If you want to delete your account, you need to enter your current password first.</Form.Description>
        <Password.Root>
          <Password.Input {...props} bind:value={$formData["current-password"]} autocomplete="current-password">
            <Password.ToggleVisibility />
          </Password.Input>
        </Password.Root>
        <div class="text-sm font-medium text-destructive">
          {#if $errors["current-password"]?.length}
            <div>{$errors["current-password"][0]}</div>
          {/if}
        </div>
      {/snippet}
    </Form.Control>
  </Form.Field>
  <Form.Field {form} name="confirm">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Confirmation</Form.Label>
        <Form.Description>
          Please type <span class="font-bold">DELETE</span> in the input below to confirm that you want to delete your account.
        </Form.Description>
        <Input {...props} bind:value={$formData.confirm} type="text" />
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>
  {#if isTainted($tainted)}
    <p class="text-center text-destructive" transition:slide>Deleting your account is permanent and cannot be undone.</p>
  {/if}
  <Form.Button disabled={!isTainted($tainted) || $submitting} class="transition-all duration-300" variant={!isTainted($tainted) ? "secondary" : "destructive"}>
    {#if !$submitting}
      Delete Account
    {:else}
      <LoaderCircle class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
