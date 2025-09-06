<script lang="ts">
  import { cn } from "$lib/utils";
  import { Button } from "$ui/button";
  import * as Card from "$ui/card";
  import { CopyButton } from "$ui/extras/copy-button";
  import * as Password from "$ui/extras/password";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import type { ZxcvbnResult } from "@zxcvbn-ts/core";
  import { Meter, PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from "bits-ui";
  import { toast } from "svelte-sonner";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { requestCode } from "./code.remote";
  import { signupFormSchema, type SignupFormSchema } from "./schema";

  type CellProps = PinInputRootSnippetProps["cells"][0];

  const { data, handleSignInButtonClick }: { data: { signupForm: SuperValidated<Infer<SignupFormSchema>> }; handleSignInButtonClick: () => void } = $props();

  const form = superForm(data.signupForm, {
    validators: zodClient(signupFormSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "oninput"
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout, errors } = form;

  let toastLoading = $state<number | string>();
  let step = $state<number>(0);
  let requestCodeLoading = $state<boolean>(false);
  let _submitted = $state<boolean>(false);
  let submitButton: HTMLButtonElement = $state(null!);
  let strength = $state<ZxcvbnResult>();

  const disableContinue = $derived.by(() => {
    if (strength?.score === undefined || strength.score < 3) return true;
    if (!isTainted($tainted?.email) || !isTainted($tainted?.mcusername) || !isTainted($tainted?.["new-password"])) return true;
    if (requestCodeLoading) return true;
    if (($errors.mcusername?.length ?? 0) > 0 || ($errors["new-password"]?.length ?? 0) > 0 || ($errors.email?.length ?? 0) > 0) return true;
    if ($submitting) return true;
    return false;
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
    <Meter.Root value={step} class={cn("relative mb-6 h-[6px] w-full gap-1 overflow-hidden rounded-full bg-accent")} min={0} max={2}>
      <div class={cn("h-full bg-primary transition-all duration-500")} style="width: {(step / 2) * 100}%;"></div>
      <!-- This creates the gaps between the bars -->
      <div class="absolute top-0 left-0 z-10 flex h-[6px] w-full place-items-center gap-1">
        {#each Array.from({ length: 2 }) as _, i (i)}
          <div class="h-[6px] w-1/2 rounded-full ring-3 ring-background"></div>
        {/each}
      </div>
    </Meter.Root>
    <Card.Title>Sign Up</Card.Title>
    <Card.Description>Sign up for an account to get the most out of MC-ID</Card.Description>
  </Card.Header>
  <Card.Content>
    <form
      method="POST"
      action="?/signup"
      use:enhance={{
        onSubmit: async () => {
          _submitted = true;
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
          _submitted = false;
        },
        onError: async () => {
          toast.error("Something went wrong while trying to sign you up.");
        }
      }}
      class="relative mx-auto grid h-1/2 max-w-md grid-cols-1 grid-rows-1 px-4 md:px-0">
      {#if step === 0}
        <div class="col-start-1 col-end-1 row-start-1 row-end-1 w-full space-y-6" out:fly={{ duration: 300, easing: cubicInOut, x: "-100%" }}>
          <Form.Field {form} name="mcusername" class="w-full">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label for={props.name}>Username</Form.Label>
                <Form.Description>This is your <span class="font-semibold">Minecraft</span> username.</Form.Description>
                <Input {...props} bind:value={$formData.mcusername} maxlength={16} type="text" autocomplete="username" name="mcusernamedecoy" id="mcusernamedecoy" />
                <Form.FieldErrors variant="single" />
              {/snippet}
            </Form.Control>
          </Form.Field>

          <Form.Field {form} name="email" class="w-full">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label for={props.name}>Email</Form.Label>
                <Form.Description>Enter your email address to be able to reset your password in the future.</Form.Description>
                <Input {...props} bind:value={$formData.email} type="text" autocomplete="email" />
                <Form.FieldErrors variant="single" />
              {/snippet}
            </Form.Control>
          </Form.Field>
          <Form.Field {form} name="new-password" class="w-full">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label for={props.name}>Password</Form.Label>
                <Form.Description>Enter a new password</Form.Description>
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
          <Button
            class="group w-full"
            disabled={disableContinue}
            onclick={async () => {
              requestCodeLoading = true;

              try {
                const response = await requestCode($formData.mcusername);
                requestCodeLoading = false;

                if (response.success) {
                  step = 1;
                } else {
                  toast.error(response.message);
                }
              } catch (e) {
                requestCodeLoading = false;
                console.error("Failed to request code:", e);

                if (e instanceof Error && e.message) {
                  toast.error(e.message);
                } else if (e && typeof e === "object" && "body" in e && e.body && typeof e.body === "object" && "message" in e.body && typeof e.body.message === "string") {
                  toast.error(e.body.message);
                } else if (typeof e === "string") {
                  toast.error(e);
                } else {
                  toast.error("An unknown error occurred while requesting the code.");
                }
              }
            }}>
            {#if requestCodeLoading}
              <LoaderCircle class="mx-auto h-4 w-4 animate-spin" />
            {:else}
              <span class="flex items-center justify-center gap-1"> Continue <ArrowRight class="transition-transform duration-150 ease-out group-enabled:group-hover:translate-x-0.5" /> </span>
            {/if}
          </Button>
        </div>
      {/if}
      {#if step >= 1}
        <div class="col-start-1 col-end-1 row-start-1 row-end-1 w-full" out:fly={{ duration: 300, easing: cubicInOut, x: "-100%" }} in:fly={{ duration: 300, easing: cubicOut, x: "100%" }}>
          <Form.Field {form} name="code" class="w-full">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label for={props.name}>Code</Form.Label>
                <Form.Description>
                  {@const copyText = "auth.mc-id.com"}
                  Start Minecraft and connect to:
                  <CopyButton text={copyText} size="sm" variant="outline" class="mx-auto my-2 flex-row-reverse">
                    <span class="font-mono text-sm font-light">{copyText}</span>
                  </CopyButton>
                  You'll get kicked from the server and provided with a 6-digit code
                </Form.Description>
                <PinInput.Root bind:value={$formData.code} maxlength={6} class="group/pininput flex items-center justify-center text-foreground has-disabled:opacity-30" pattern={REGEXP_ONLY_DIGITS} {...props}>
                  {#snippet children({ cells })}
                    <div class="flex">
                      {#each cells.slice(0, 3) as cell, i (i)}
                        {@render Cell(cell)}
                      {/each}
                    </div>

                    <div class="flex w-10 items-center justify-center">
                      <div class="h-1 w-3 rounded-full bg-border"></div>
                    </div>
                    <div class="flex">
                      {#each cells.slice(3, 6) as cell, i (i)}
                        {@render Cell(cell)}
                      {/each}
                    </div>
                  {/snippet}
                </PinInput.Root>
                <Form.FieldErrors variant="single" />
              {/snippet}
            </Form.Control>
          </Form.Field>

          <Form.Button bind:ref={submitButton} disabled={!isTainted($tainted) || !$formData.code || ($errors.code?.length ?? 0) > 0 || $submitting} class="w-full" onclick={() => (step = 2)}>
            {#if !$submitting}
              Sign up
            {:else}
              <LoaderCircle class="mx-auto h-4 w-4 animate-spin" />
            {/if}
          </Form.Button>
        </div>
      {/if}
    </form>
  </Card.Content>
  <Card.Footer>
    <p class="w-full text-center text-sm">
      <span class="opacity-50">Already have an account?</span>
      <Button variant="link" onclick={handleSignInButtonClick} class="inline-block p-0 underline underline-offset-2 opacity-50 transition-opacity duration-300 hover:opacity-100">Sign in</Button>
    </p>
  </Card.Footer>
</Card.Root>

{#snippet Cell(cell: CellProps)}
  <PinInput.Cell
    {cell}
    class={cn(
      // Custom class to override global focus styles
      "focus-override",
      "relative h-14 w-10 text-[2rem]",
      "flex items-center justify-center",
      "transition-all duration-75",
      "border-y border-r border-foreground/20 first:rounded-l-md first:border-l last:rounded-r-md",
      "text-foreground group-focus-within/pininput:border-primary/40 group-hover/pininput:border-primary/40",
      "outline-0",
      "data-active:outline-1 data-active:outline-primary"
    )}>
    {#if cell.char !== null}
      <div>
        {cell.char}
      </div>
    {/if}
    {#if cell.hasFakeCaret}
      <div class="pointer-events-none absolute inset-0 flex animate-caret-blink items-center justify-center">
        <div class="h-8 w-px bg-primary"></div>
      </div>
    {/if}
  </PinInput.Cell>
{/snippet}
