<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { toast } from "svelte-sonner";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { PageServerData } from "./$types";
  import { forgotPasswordSchema } from "./schema";

  const { data }: { data: PageServerData } = $props();

  let toastLoading = $state<number | string>();

  const form = $derived(
    superForm(data.forgotPasswordForm, {
      validators: zodClient(forgotPasswordSchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = $derived(form);

  $effect(() => {
    timeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to send the password reset email...", {
          id: toastLoading
        });
      }
    });
  });
</script>

<Card.Root class="bg-background">
  <Card.Header>
    <Card.Title>Forgot Password</Card.Title>
    <Card.Description>Enter your MC-ID email below to receive a password reset link</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-2">
    <form
      method="POST"
      action="?/request"
      use:enhance={{
        onSubmit: async () => {
          toastLoading = toast.loading("Sending password reset email...");
        },
        onResult: async () => {
          setTimeout(() => toast.dismiss(toastLoading), 300);
        },
        onUpdate: async ({ result }) => {
          if (result.type === "success") {
            toast.success("Password reset email sent successfully!");
          } else {
            toast.error(result.data.error ?? "Failed to send password reset email. Please check your email address.");
          }
        },
        onError: async () => {
          toast.error("Something went wrong while trying to send the password reset email.");
        }
      }}
      class="relative mx-auto flex h-1/2 max-w-md flex-col justify-center gap-y-2 self-center px-4 md:px-0">
      <Form.Field {form} name="email">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label for={props.name}>Email</Form.Label>
            <Form.Description>This is your <span class="font-semibold">MC-ID</span> email.</Form.Description>
            <Input {...props} bind:value={$formData.email} type="text" autocomplete="email webauthn" />
            <Form.FieldErrors variant="single" />
          {/snippet}
        </Form.Control>
      </Form.Field>

      <Form.Button disabled={!isTainted($tainted) || $submitting} class="transition-all duration-300">
        {#if !$submitting}
          Send Reset Link
        {:else}
          <LoaderCircle class="h-4 w-4 animate-spin" />
        {/if}
      </Form.Button>
    </form>
  </Card.Content>
  <Card.Footer class="flex flex-col items-center justify-center gap-y-2">
    <p class="w-full text-center text-sm">
      <span class="opacity-50"> Remembered your password? </span>
      <Button variant="link" href={resolve("/login")} class={`inline-block p-0 underline underline-offset-2 opacity-50 transition-opacity duration-300 hover:opacity-100 ${$submitting ? "pointer-events-none cursor-default" : ""}`}>Log in</Button>
    </p>
  </Card.Footer>
</Card.Root>
