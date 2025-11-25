<script lang="ts">
  import * as Password from "$ui/extras/password";
  import * as Form from "$ui/form";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import type { ZxcvbnResult } from "@zxcvbn-ts/core";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { passwordUpdateSchema, type PasswordUpdateSchema } from "./schema";

  const { data }: { data: { passwordUpdateForm: SuperValidated<Infer<PasswordUpdateSchema>> } } = $props();

  const form = superForm(data.passwordUpdateForm, {
    validators: zodClient(passwordUpdateSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "onblur"
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout, errors } = form;

  let toastLoading = $state<number | string>();
  let strength = $state<ZxcvbnResult>();

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to update your password...", {
        id: toastLoading
      });
    }
  });
</script>

<form
  method="POST"
  action="?/updatePassword"
  use:enhance={{
    onSubmit: async () => {
      toastLoading = toast.loading("Updating your password...");
    },
    onResult: async () => {
      setTimeout(() => toast.dismiss(toastLoading), 300);
    },
    onUpdate: async ({ result }) => {
      if (result.type === "success") {
        toast.success("Password updated successfully!");
      } else {
        toast.error(result.data.error ?? "Failed to update password.");
      }
    },
    onError: async () => {
      toast.error("Something went wrong while trying to update your password.");
    }
  }}
  class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  <Form.Field {form} name="current-password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Current Password</Form.Label>
        <Form.Description>If you want to change your password, you need to enter your current password first.</Form.Description>
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
  <Form.Field {form} name="new-password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>New Password</Form.Label>
        <Form.Description>Your new password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.</Form.Description>
        <Password.Root>
          <Password.Input {...props} bind:value={$formData["new-password"]} autocomplete="new-password">
            <Password.ToggleVisibility />
          </Password.Input>
          <Password.Strength bind:strength />
        </Password.Root>
        <div class="text-sm font-medium text-destructive">
          {#if $errors["new-password"]?.length}
            <div>{$errors["new-password"][0]}</div>
          {/if}
        </div>
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Field {form} name="confirm-password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Confirm Password</Form.Label>
        <Form.Description>Please confirm your new password by entering it again.</Form.Description>
        <Password.Root>
          <Password.Input {...props} bind:value={$formData["confirm-password"]} autocomplete="new-password">
            <Password.ToggleVisibility />
          </Password.Input>
        </Password.Root>
        <div class="text-sm font-medium text-destructive">
          {#if $errors["confirm-password"]?.length}
            <div>{$errors["confirm-password"][0]}</div>
          {/if}
        </div>
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Button disabled={!isTainted($tainted) || $submitting} class="transition-all duration-300" variant={!isTainted($tainted) ? "secondary" : "default"}>
    {#if !$submitting}
      Update Password
    {:else}
      <LoaderCircle class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
