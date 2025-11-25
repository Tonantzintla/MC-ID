<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import * as InputOTP from "$lib/components/ui/input-otp";
  import * as Item from "$lib/components/ui/item";
  import { Label } from "$lib/components/ui/label";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { type PrimaryMcAccount } from "$lib/types/global";
  import { CopyButton } from "$ui/extras/copy-button";
  import * as Form from "$ui/form";
  import { Spinner } from "$ui/spinner";
  import Crown from "@lucide/svelte/icons/crown";
  import Unlink from "@lucide/svelte/icons/unlink";
  import { REGEXP_ONLY_DIGITS } from "bits-ui";
  import { toast } from "svelte-sonner";
  import { fly } from "svelte/transition";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import type { ZodSafeParseResult } from "zod";
  import type { PageServerData } from "./$types";
  import { makePrimary, minecraftAccounts, requestCode, unlinkAccount } from "./minecraft.remote";
  import { requestCodeFormSchema, username } from "./schema";

  let { data }: { data: PageServerData } = $props();

  const form = superForm(data.verifyCodeForm, {
    validators: zodClient(requestCodeFormSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "onblur"
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = form;

  let toastLoading = $state<number | string>();

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to verify your code...", {
        id: toastLoading
      });
    }
  });

  let mcUsernameInput = $state<string>("");
  let mcUsername = $derived<ZodSafeParseResult<string>>(username.safeParse(mcUsernameInput));
  let step = $state<"request" | "verify">("request");

  let loadingRequest = $state<boolean>(false);

  const handleRequestCode = async () => {
    if (!mcUsername.success) return;
    loadingRequest = true;
    try {
      const result = await requestCode({ username: mcUsername.data }).finally(() => {
        loadingRequest = false;
      });
      if (result.success) {
        step = "verify";
      } else {
        toast.error(result.message ?? "Failed to request verification code.");
      }
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = error instanceof Error ? error.message : ((error as any)?.body?.message ?? "An unknown error occurred while requesting the verification code.");
      toast.error(errorMessage);
      loadingRequest = false;
    }
  };

  const handleUnlink = async (uuid: string) => {
    const toastId = toast.loading("Unlinking Minecraft account...");
    try {
      const result = await unlinkAccount({ uuid });
      if (result.success) {
        toast.success("Minecraft account unlinked successfully!", { id: toastId });
        window.location.reload();
      } else {
        toast.error(result.message ?? "Failed to unlink Minecraft account.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = error instanceof Error ? error.message : ((error as any)?.body?.message ?? "An unknown error occurred while requesting the verification code.");
      toast.error(errorMessage);
      loadingRequest = false;
    }
  };

  const handleMakePrimary = async (uuid: string) => {
    const toastId = toast.loading("Setting Minecraft account as primary...");
    try {
      const result = await makePrimary({ uuid });

      if (result.success) {
        toast.success("Minecraft account set as primary successfully!", { id: toastId });
        window.location.reload();
      } else {
        toast.error(result.message ?? "Failed to set Minecraft account as primary.", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = error instanceof Error ? error.message : ((error as any)?.body?.message ?? "An unknown error occurred while requesting the verification code.");
      toast.error(errorMessage);
      loadingRequest = false;
    }
  };

  const allMinecraftAccounts = minecraftAccounts();
</script>

<Card.Root class="grid grid-cols-1 grid-rows-1 overflow-clip">
  {#if step === "request"}
    <div class="col-[1] row-[1] space-y-2" in:fly={{ x: "100%" }} out:fly={{ x: "-100%" }}>
      <Card.Header>
        <Card.Title>Add Minecraft Account</Card.Title>
        <Card.Description>To link your Minecraft account, please enter your Minecraft username below.</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-2">
        <Label for="mcUsername">Minecraft Username</Label>
        <Input type="text" name="mcUsername" id="mcUsername" bind:value={mcUsernameInput} />
        {#if mcUsername.error && mcUsernameInput}
          <p class="text-sm text-destructive">{mcUsername.error.issues[0].message}</p>
        {/if}
      </Card.Content>
      <Card.Footer>
        <Button disabled={!mcUsername.success || loadingRequest} onclick={handleRequestCode}>
          {#if loadingRequest}
            <Spinner />
          {:else}
            Add Minecraft Account
          {/if}
        </Button>
      </Card.Footer>
    </div>
  {:else if step === "verify"}
    <div class="col-[1] row-[1] space-y-2" in:fly={{ x: "100%" }} out:fly={{ x: "-100%" }}>
      <Card.Header>
        <Card.Title>Enter Code</Card.Title>
        <Card.Description class="space-y-1">
          <p>
            Start Minecraft and connect to
            <CopyButton text="auth.mc-id.com" variant="ghost" size="sm" class="inline-flex h-auto flex-row-reverse overflow-visible px-0 text-muted-foreground hover:text-foreground dark:hover:bg-transparent">
              <div class="rounded-sm bg-accent p-0.5 font-mono">auth.mc-id.com</div>
            </CopyButton>
          </p>
          <p>You'll get kicked from the server and provided with a code, enter the 6-digit code below to link your Minecraft account.</p>
        </Card.Description>
      </Card.Header>
      <Card.Content class="space-y-2">
        <form
          method="POST"
          action="?/verifyCode"
          use:enhance={{
            onSubmit: async () => {
              $formData.username = mcUsername.data!;
              toastLoading = toast.loading("Verifying your code...");
            },
            onResult: async () => {
              setTimeout(() => toast.dismiss(toastLoading), 300);
            },
            onUpdate: async ({ result }) => {
              console.info(result);
              if (result.type === "success") {
                // Refresh the accounts list after adding a new one
                minecraftAccounts().refresh();
                toast.success("Minecraft account linked successfully!");
                window.location.reload();
              } else {
                toast.error(result.data.error ?? "Failed to verify code.");
              }
            },
            onError: async () => {
              toast.error("Something went wrong while trying to verify your code.");
            }
          }}>
          <Form.Field {form} name="code">
            <Form.Control>
              {#snippet children({ props })}
                <InputOTP.Root maxlength={6} pattern={REGEXP_ONLY_DIGITS} bind:value={$formData.code} {...props} class="my-6 justify-center">
                  {#snippet children({ cells })}
                    <InputOTP.Group>
                      {#each cells.slice(0, 3) as cell, index (index)}
                        <InputOTP.Slot class="size-12 text-2xl sm:size-16 sm:text-4xl" {cell} />
                      {/each}
                    </InputOTP.Group>
                    <InputOTP.Separator class="opacity-50">-</InputOTP.Separator>
                    <InputOTP.Group>
                      {#each cells.slice(3, 6) as cell, index (index)}
                        <InputOTP.Slot class="size-12 text-2xl sm:size-16 sm:text-4xl" {cell} />
                      {/each}
                    </InputOTP.Group>
                  {/snippet}
                </InputOTP.Root>
                <Form.FieldErrors variant="single" />
              {/snippet}
            </Form.Control>
          </Form.Field>

          <Form.Button disabled={!isTainted($tainted) || $submitting}>
            {#if $submitting}
              <Spinner />
            {:else}
              Verify Code
            {/if}
          </Form.Button>
        </form>
      </Card.Content>
    </div>
  {/if}
</Card.Root>

<svelte:boundary>
  {#each (await allMinecraftAccounts).sort((a) => (a.primary ? -1 : 1)) as mcAccount (mcAccount.id)}
    {@render mcAccountItem(mcAccount)}
  {/each}

  {#snippet pending()}
    <div class="flex w-full items-center justify-center py-10">
      <Spinner />
    </div>
  {/snippet}
  {#snippet failed()}
    <Card.Root>
      <Card.Header>
        <Card.Title>Something went wrong</Card.Title>
        <Card.Description>We couldn't load your Minecraft accounts. Please try again later.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Button onclick={async () => await allMinecraftAccounts.refresh()} disabled={allMinecraftAccounts.loading} variant="secondary">
          {#if allMinecraftAccounts.loading}
            <Spinner />
          {:else}
            Retry
          {/if}
        </Button>
      </Card.Content>
    </Card.Root>
  {/snippet}
</svelte:boundary>

{#snippet mcAccountItem(account: PrimaryMcAccount & { primary: boolean })}
  <Item.Root variant="outline" class="overflow-clip">
    <Item.Media class="pointer-events-none relative select-none group-has-[[data-slot=item-description]]/item:translate-y-0 group-has-[[data-slot=item-description]]/item:self-center">
      <Avatar.Root class="size-16 rounded-none">
        <Avatar.Image src="https://nmsr.nickac.dev/face/{account.uuid}" alt={account.username} />
        <Avatar.Fallback class="rounded-lg">
          {account.username.slice(0, 2).toUpperCase()}
        </Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root class="absolute -z-10 size-16 rounded-none opacity-80 blur-2xl">
        <Avatar.Image src="https://nmsr.nickac.dev/face/{account.uuid}" alt={account.username} />
        <Avatar.Fallback class="rounded-lg">
          {account.username.slice(0, 2).toUpperCase()}
        </Avatar.Fallback>
      </Avatar.Root>
    </Item.Media>
    <Item.Content>
      <Item.Title class="text-lg">
        {account.username}
      </Item.Title>
      <Item.Description class="flex flex-row items-center gap-0">
        <CopyButton text={account.uuid} variant="ghost" size="sm" class="h-auto flex-row-reverse overflow-visible px-0 text-muted-foreground hover:text-foreground dark:hover:bg-transparent">
          <div class="rounded-sm bg-popover p-0.5 font-mono">{account.uuid}</div>
        </CopyButton>
      </Item.Description>
    </Item.Content>
    <Item.Actions>
      <svelte:boundary>
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button variant="outline" size="sm" {...props}>
                <Unlink />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="space-y-2">
            {#if account.primary}
              <p class="text-sm">This is your primary Minecraft account. You cannot unlink it unless you set another account as primary.</p>
            {:else}
              <p class="text-sm">Are you sure you want to unlink this Minecraft account?</p>
              <Button variant="outline" size="sm" class="w-full" onclick={async () => await handleUnlink(account.uuid)}>
                Unlink <Unlink />
              </Button>
            {/if}
          </Popover.Content>
        </Popover.Root>

        {#snippet pending()}
          <Button disabled variant="outline" size="sm">
            <Spinner />
          </Button>
        {/snippet}
      </svelte:boundary>

      <svelte:boundary>
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button variant="outline" size="sm" {...props}>
                <Crown data-primary={account.primary} class=" data-[primary=true]:fill-yellow-300 data-[primary=true]:text-yellow-300" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="space-y-2">
            {#if account.primary}
              <p class="text-sm">This is already your primary Minecraft account.</p>
            {:else}
              <p class="text-sm">Are you sure you want to make this Minecraft account your primary account?</p>
              <Button variant="outline" size="sm" class="w-full" disabled={account.primary} onclick={async () => await handleMakePrimary(account.uuid)}>
                Make Primary <Crown data-primary={account.primary} class="data-[primary=true]:fill-yellow-300 data-[primary=true]:text-yellow-300" />
              </Button>
            {/if}
          </Popover.Content>
        </Popover.Root>

        {#snippet pending()}
          <Button disabled variant="outline" size="sm">
            <Spinner />
          </Button>
        {/snippet}
      </svelte:boundary>
    </Item.Actions>
  </Item.Root>
{/snippet}
