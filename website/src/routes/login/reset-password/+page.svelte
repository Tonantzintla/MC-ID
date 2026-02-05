<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Empty from "$ui/empty";
  import * as Password from "$ui/extras/password";
  import * as Form from "$ui/form";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import XIcon from "@lucide/svelte/icons/x";
  import type { ZxcvbnResult } from "@zxcvbn-ts/core";
  import { toast } from "svelte-sonner";
  import { cubicInOut } from "svelte/easing";
  import { SvelteURLSearchParams } from "svelte/reactivity";
  import { fly } from "svelte/transition";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { PageServerData } from "./$types";
  import { resetPasswordFormSchema } from "./schema";

  const { data }: { data: PageServerData } = $props();

  let toastLoading = $state<number | string>();
  let strength = $state<ZxcvbnResult>();
  let anyErrors = $state(false);

  const passesStrength = $derived((strength?.score ?? 0) >= 3);
  const queryParams = $derived(new SvelteURLSearchParams(page.url.searchParams));
  const token = $derived(queryParams.get("token"));

  const form = $derived(
    superForm(data.resetPasswordForm, {
      validators: zodClient(resetPasswordFormSchema),
      dataType: "json",
      timeoutMs: 2000,
      validationMethod: "onblur"
    })
  );

  const { form: formData, enhance, tainted, isTainted, submitting, timeout, errors } = $derived(form);

  $effect(() => {
    errors.subscribe((value) => {
      anyErrors = Object.values(value).some((v) => v !== undefined && v.length > 0);
    });
  });

  $effect(() => {
    timeout.subscribe((value) => {
      if (value) {
        toast.loading("It's taking longer than expected to reset your password...", {
          id: toastLoading
        });
      }
    });
  });
</script>

<Card.Root class="relative overflow-clip bg-background">
  <Card.Header>
    <Card.Title>Reset Password</Card.Title>
    <Card.Description>Reset your password to regain access to your account</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if !token}
      <Empty.Root class="border">
        <Empty.Header>
          <Empty.Media variant="icon">
            <XIcon />
          </Empty.Media>
          <Empty.Title>Invalid or Missing Token</Empty.Title>
          <Empty.Description>The token provided is either invalid or missing. Please check the link you received or request a new password reset.</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <div class="flex gap-2">
            <Button size="sm" href={resolve("/login/forgot-password")}>Request New Token</Button>
          </div>
        </Empty.Content>
      </Empty.Root>
    {:else}
      <form
        method="POST"
        action="?/reset"
        use:enhance={{
          onSubmit: async () => {
            $formData.token = token;
            toastLoading = toast.loading("Resetting your password...");
          },
          onResult: async () => {
            setTimeout(() => toast.dismiss(toastLoading), 300);
          },
          onUpdate: async ({ result }) => {
            if (result.type === "success") {
              toast.success("Password reset successfully!");
            } else {
              toast.error(result.data.error ?? "Failed to reset password. Please check the form for errors.");
            }
          },
          onError: async () => {
            toast.error("Something went wrong while trying to reset your password.");
          }
        }}
        class="relative mx-auto grid h-1/2 max-w-md grid-cols-1 grid-rows-1 px-4 md:px-0">
        <div class="col-start-1 col-end-1 row-start-1 row-end-1 w-full space-y-6" out:fly={{ duration: 300, easing: cubicInOut, x: "-100%" }}>
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
              Reset Password
            {:else}
              <LoaderCircle class="mx-auto h-4 w-4 animate-spin" />
            {/if}
          </Form.Button>
        </div>
      </form>
    {/if}
  </Card.Content>
</Card.Root>
