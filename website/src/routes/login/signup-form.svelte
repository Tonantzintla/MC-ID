<script lang="ts">
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Password from "$ui/extras/password";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import type { ZxcvbnResult } from "@zxcvbn-ts/core";
  import { toast } from "svelte-sonner";
  import { cubicInOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { signupFormSchema, type SignupFormSchema } from "./schema";

  const { data, handleSignInButtonClick }: { data: { signupForm: SuperValidated<Infer<SignupFormSchema>> }; handleSignInButtonClick: () => void } = $props();

  const form = superForm(data.signupForm, {
    validators: zodClient(signupFormSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "onblur"
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout, errors } = form;

  let toastLoading = $state<number | string>();
  let strength = $state<ZxcvbnResult>();
  let anyErrors = $state(false);

  const passesStrength = $derived((strength?.score ?? 0) >= 3);

  errors.subscribe((value) => {
    anyErrors = Object.values(value).some((v) => v !== undefined && v.length > 0);
  });

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to sign you up...", {
        id: toastLoading
      });
    }
  });
</script>

<Card.Root class="relative overflow-clip bg-background">
  <Card.Header>
    <Card.Title>Sign Up</Card.Title>
    <Card.Description>Sign up for an account to get the most out of MC-ID</Card.Description>
  </Card.Header>
  <Card.Content>
    <form
      method="POST"
      action="?/signup"
      use:enhance={{
        onSubmit: async () => {
          toastLoading = toast.loading("Creating your account...");
        },
        onResult: async () => {
          setTimeout(() => toast.dismiss(toastLoading), 300);
        },
        onUpdate: async ({ result }) => {
          if (result.type === "success") {
            toast.success("Account created successfully!");
          } else {
            toast.error(result.data.error ?? "Failed to create account. Please check the form for errors.");
          }
        },
        onError: async () => {
          toast.error("Something went wrong while trying to sign you up.");
        }
      }}
      class="relative mx-auto grid h-1/2 max-w-md grid-cols-1 grid-rows-1 px-4 md:px-0">
      <div class="col-start-1 col-end-1 row-start-1 row-end-1 w-full space-y-6" out:fly={{ duration: 300, easing: cubicInOut, x: "-100%" }}>
        <Form.Field {form} name="email" class="w-full">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label for={props.name}>Email</Form.Label>
              <Form.Description>We'll send you a confirmation email to verify your account.</Form.Description>
              <Input {...props} bind:value={$formData.email} type="text" autocomplete="email" />
              <Form.FieldErrors variant="single" />
            {/snippet}
          </Form.Control>
        </Form.Field>
        <Form.Field {form} name="new-password" class="w-full">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label for={props.name}>Password</Form.Label>
              <Form.Description>Your password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.</Form.Description>
              <Password.Root>
                <Password.Input {...props} bind:value={$formData["new-password"]}>
                  <Password.ToggleVisibility />
                </Password.Input>
                <Password.Strength bind:strength />
              </Password.Root>
              <Form.FieldErrors variant="single" />
            {/snippet}
          </Form.Control>
        </Form.Field>

        <Form.Field {form} name="confirm-password">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label for={props.name}>Confirm Password</Form.Label>
              <Form.Description>Please re-enter your password to confirm it matches the one you entered above.</Form.Description>
              <Password.Root>
                <Password.Input {...props} bind:value={$formData["confirm-password"]}>
                  <Password.ToggleVisibility />
                </Password.Input>
              </Password.Root>
              <Form.FieldErrors variant="single" />
            {/snippet}
          </Form.Control>
        </Form.Field>

        <Form.Button disabled={!isTainted($tainted) || $submitting || anyErrors || !passesStrength} class="w-full">
          {#if !$submitting}
            Create Account
          {:else}
            <LoaderCircle class="mx-auto h-4 w-4 animate-spin" />
          {/if}
        </Form.Button>
      </div>
    </form>
  </Card.Content>
  <Card.Footer>
    <p class="w-full text-center text-sm">
      <span class="opacity-50">Already have an account?</span>
      <Button variant="link" onclick={handleSignInButtonClick} class="inline-block p-0 underline underline-offset-2 opacity-50 transition-opacity duration-300 hover:opacity-100">Sign in</Button>
    </p>
  </Card.Footer>
</Card.Root>
