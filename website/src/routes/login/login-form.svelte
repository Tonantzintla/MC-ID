<script lang="ts">
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/auth-client";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import * as Password from "$ui/extras/password";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import Key from "@lucide/svelte/icons/key";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { loginFormSchema, type LoginFormSchema } from "./schema";

  const { data, handleSignUpButtonClick, handleMcSignInButtonClick }: { data: { loginForm: SuperValidated<Infer<LoginFormSchema>> }; handleSignUpButtonClick: () => void; handleMcSignInButtonClick: () => void } = $props();

  const form = superForm(data.loginForm, {
    validators: zodClient(loginFormSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "oninput"
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = form;

  let toastLoading = $state<number | string>();

  async function signInWithPasskey(autoFill = false) {
    await authClient.signIn.passkey({
      autoFill,
      fetchOptions: {
        onSuccess: (_context) => {
          goto("/dashboard");
        },
        onError: (error) => {
          console.error("Failed to login with passkey", error);
          toast.error(`Failed to login with passkey: ${error.error.message}`);
        }
      }
    });
  }

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to log you in...", {
        id: toastLoading
      });
    }
  });

  $effect(() => {
    if (!PublicKeyCredential.isConditionalMediationAvailable || !PublicKeyCredential.isConditionalMediationAvailable()) {
      return;
    }

    untrack(async () => {
      void (await signInWithPasskey(true));
    });
  });
</script>

<Card.Root class="bg-background">
  <Card.Header>
    <Card.Title>Login</Card.Title>
    <Card.Description>Enter your MC-ID credentials below to login to your account</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-2">
    <form
      method="POST"
      action="?/login"
      use:enhance={{
        onSubmit: async () => {
          toastLoading = toast.loading("Logging you in...");
        },
        onResult: async () => {
          setTimeout(() => toast.dismiss(toastLoading), 300);
        },
        onUpdate: async ({ result }) => {
          if (result.type === "success") {
            toast.success("Logged in successfully!");
          } else {
            toast.error(result.data.error ?? "Failed to login. Please check your credentials.");
          }
        },
        onError: async () => {
          toast.error("Something went wrong while trying to login.");
        }
      }}
      class="relative mx-auto flex h-1/2 max-w-md flex-col justify-center gap-y-2 self-center px-4 md:px-0">
      <Form.Field {form} name="email">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label for={props.name}>Email</Form.Label>
            <Form.Description>This is your <span class="font-semibold">MC-ID</span> email.</Form.Description>
            <Input {...props} bind:value={$formData.email} maxlength={16} type="text" autocomplete="email webauthn" />
            <Form.FieldErrors variant="single" />
          {/snippet}
        </Form.Control>
      </Form.Field>
      <Form.Field {form} name="current-password">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label for={props.name}>Password</Form.Label>
            <Form.Description>
              This is your <span class="font-semibold">MC-ID</span> password.
            </Form.Description>

            <Password.Root>
              <Password.Input {...props} bind:value={$formData["current-password"]} autocomplete="current-password webauthn">
                <Password.ToggleVisibility />
              </Password.Input>
            </Password.Root>
            <Form.FieldErrors variant="single" />
          {/snippet}
        </Form.Control>
      </Form.Field>

      <Form.Button disabled={!isTainted($tainted) || $submitting} class="transition-all duration-300">
        {#if !$submitting}
          Login
        {:else}
          <LoaderCircle class="h-4 w-4 animate-spin" />
        {/if}
      </Form.Button>
    </form>

    <div class="flex flex-col items-center justify-center gap-y-2">
      <span class="w-full text-center text-sm opacity-50">Or</span>
      <Button class="w-full" variant="outline" data-disabled={$submitting} data-sveltekit-preload-data="tap" onclick={async () => await signInWithPasskey()}>
        <Key class="pointer-events-none h-6 w-auto transition-opacity duration-300 select-none group-hover:opacity-70" />
        Login with Passkey
      </Button>
      <Button class="w-full" variant="outline" data-disabled={$submitting} data-sveltekit-preload-data="tap" onclick={handleMcSignInButtonClick}>
        <enhanced:img src="$lib/assets/MC-ID-White.svg" class="pointer-events-none h-4 w-auto transition-opacity duration-300 select-none group-hover:opacity-70" alt="MC-ID" />
        Login with MC-ID
      </Button>
    </div>
  </Card.Content>
  <Card.Footer>
    <p class="w-full text-center text-sm">
      <span class="opacity-50">Don't have an account?</span>
      <Button variant="link" onclick={handleSignUpButtonClick} class={`inline-block p-0 underline underline-offset-2 opacity-50 transition-opacity duration-300 hover:opacity-100 ${$submitting ? "pointer-events-none cursor-default" : ""}`}>Sign up</Button>
    </p>
  </Card.Footer>
</Card.Root>
