<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import * as Accordion from "$lib/components/ui/accordion";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Scope, scopes } from "$lib/scopes";
  import { cn } from "$lib/utils";
  import * as Alert from "$ui/alert";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import { CopyButton } from "$ui/extras/copy-button";
  import * as Password from "$ui/extras/password";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import { Textarea } from "$ui/textarea";
  import * as Tooltip from "$ui/tooltip";
  import type { OAuthClient } from "@better-auth/oauth-provider";
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import CircleMinus from "@lucide/svelte/icons/circle-minus";
  import CircleQuestionMark from "@lucide/svelte/icons/circle-question-mark";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { Debounced, TextareaAutosize } from "runed";
  import { tick } from "svelte";
  import { toast } from "svelte-sonner";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { resetSecret } from "./[id]/reset.remote";
  import { appSchema, deleteAppSchema, type AppSchema, type DeleteAppSchema } from "./schema";
  import { AppFormVariant } from "./types.d";

  const { data, variant }: { data: { appForm: SuperValidated<Infer<AppSchema>>; deleteAppForm: SuperValidated<Infer<DeleteAppSchema>>; appData?: OAuthClient }; variant: AppFormVariant } = $props();
  const { appData } = $derived(data);

  let toastLoading = $state<number | string>();
  let textAreaEl = $state<HTMLTextAreaElement>(null!);
  let appSecret = $state<string>();
  let resettingSecret = $state<boolean>(false);
  let urlErrors = $state<boolean>(false);
  let contactErrors = $state<boolean>(false);

  const isCreate = $derived(variant == (AppFormVariant.CREATE as const));
  const isEdit = $derived(variant == (AppFormVariant.EDIT as const));

  // Use better-auth's reactive session store for real-time updates
  const session = authClient.useSession();
  const emailVerified = $derived($session.data?.user?.emailVerified ?? false);

  const language = $derived({
    action: isCreate ? "creating" : "editing",
    success: isCreate ? "created" : "updated",
    normal: isCreate ? "create" : "edit"
  } as const);

  // svelte-ignore state_referenced_locally
  const appForm = superForm(data.appForm, {
    validators: zodClient(appSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "oninput",
    invalidateAll: isEdit ? "pessimistic" : undefined
  });

  const deleteAppForm = superForm(data.deleteAppForm, {
    validators: zodClient(deleteAppSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "onblur"
  });

  const { form: appFormData, enhance: appEnhance, tainted: appTainted, isTainted: appIsTainted, submitting: appSubmitting, timeout: appTimeout, errors: appErrors } = $derived(appForm);

  const { form: deleteAppFormData, enhance: deleteAppEnhance, submitting: deleteAppSubmitting } = $derived(deleteAppForm);

  const debouncediconUrlValue = $state(new Debounced(() => $appFormData.logoUrl, 300));

  const avatar = $derived.by(() => {
    if ($appErrors.logoUrl === undefined && $appFormData.logoUrl && debouncediconUrlValue.current) {
      return debouncediconUrlValue.current;
    }
    return createAvatar(botttsNeutral, {
      size: 128,
      seed: appData?.client_id
    }).toDataUri();
  });

  const addUrl = () => {
    $appFormData.redirectUris = [...$appFormData.redirectUris, ""];

    tick().then(() => {
      const urlInputs = Array.from(document.querySelectorAll<HTMLElement>("#profile-form input[name='redirectUris']"));
      const lastInput = urlInputs[urlInputs.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
    });
  };

  const addContact = () => {
    $appFormData.contacts = [...$appFormData.contacts, ""];

    tick().then(() => {
      const contactInputs = Array.from(document.querySelectorAll<HTMLElement>("#profile-form input[name='contacts']"));
      const lastInput = contactInputs[contactInputs.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
    });
  };

  function addItem(value: Scope) {
    $appFormData.scopes = [...$appFormData.scopes, value];
  }

  function removeItem(value: Scope) {
    $appFormData.scopes = $appFormData.scopes.filter((i) => i !== value);
  }

  new TextareaAutosize({
    element: () => textAreaEl,
    input: () => $appFormData.description ?? "",
    maxHeight: 200
  });

  appTimeout.subscribe((value) => {
    if (value) {
      toast.loading(`It's taking longer than expected to ${language.normal} your app...`, {
        id: toastLoading
      });
    }
  });

  appErrors.subscribe(({ redirectUris, contacts }) => {
    if (redirectUris) {
      urlErrors = Object.values(redirectUris).some((uri) => uri !== undefined);
    } else {
      urlErrors = false;
    }

    if (contacts) {
      contactErrors = Object.values(contacts).some((email) => email !== undefined);
    } else {
      contactErrors = false;
    }
  });
</script>

<form
  method="POST"
  action={isCreate ? "?/createApp" : `?/editApp`}
  use:appEnhance={{
    onSubmit: async () => {
      toastLoading = toast.loading(`${language.action} your app...`);
    },
    onResult: async () => {
      setTimeout(() => toast.dismiss(toastLoading), 300);
    },
    onUpdate: async ({ result }) => {
      if (result.type === "success") {
        toast.success(`App ${language.success} successfully!`);
      } else {
        if (isEdit) {
          appForm.reset();
        }
        toast.error(`Failed to ${language.normal} app. Please check the form for errors.`);
      }
    },
    onError: async () => {
      if (isEdit) {
        appForm.reset();
      }
      toast.error(`An error occurred while ${language.action} your app. Please try again.`);
    }
  }}
  class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  {#if isEdit}
    <div class="flex items-center justify-center">
      <Avatar.Root class="pointer-events-none flex h-16 w-16 items-center justify-center select-none">
        <Avatar.Image src={avatar} alt="App Avatar" class="h-16 w-16 rounded-full" />
        <Avatar.Fallback>{$appFormData.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
    </div>

    {#if $appFormData}
      <div class="flex flex-col gap-4">
        {#if $appFormData.id}
          <Form.Field form={appForm} name="id">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label for={props.name}>
                  <Tooltip.Root>
                    <Tooltip.Trigger>
                      <CircleQuestionMark class="size-4 text-muted-foreground" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <p>Used in API requests and can not be changed.</p>
                    </Tooltip.Content>
                  </Tooltip.Root>
                  App ID
                </Form.Label>
                <Form.Description>This is your app's unique identifier</Form.Description>
                <CopyButton text={$appFormData.id ?? "No ID"} size="default" variant="outline" class="w-full justify-start" id={props.name}>
                  <span class="font-mono text-sm font-light">{$appFormData.id}</span>
                </CopyButton>
              {/snippet}
            </Form.Control>
          </Form.Field>
        {/if}
        <div class="space-y-2">
          <Label for="secret" class="flex items-center gap-2">
            <Tooltip.Root>
              <Tooltip.Trigger>
                <CircleQuestionMark class="size-4 text-muted-foreground" />
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Used in API requests and can not be changed.</p>
              </Tooltip.Content>
            </Tooltip.Root>
            App Secret
          </Label>
          <div class="text-sm text-muted-foreground">This is your app's secret key</div>

          <div class="flex gap-2">
            <Password.Root class="w-full">
              <Password.Input value={appSecret} readonly autocomplete="off" id="secret">
                <Password.Copy />
                <Password.ToggleVisibility />
              </Password.Input>
            </Password.Root>

            <Button
              class="group"
              variant="secondary"
              type="button"
              disabled={resettingSecret || $appSubmitting}
              onclick={() => {
                resettingSecret = true;
                toast.promise(
                  new Promise((resolve, reject) => {
                    if (!$appFormData.id) {
                      reject(new Error("App ID is required to reset the secret."));
                      return;
                    }
                    resetSecret($appFormData.id)
                      .then(({ secret, success }) => {
                        if (!success) throw new Error("Failed to reset secret.");
                        appSecret = secret;
                        resolve(data);
                      })
                      .catch(reject)
                      .finally(() => {
                        resettingSecret = false;
                      });
                  }),
                  {
                    loading: "Resetting secret...",
                    success: "Secret reset successfully!",
                    error: "Failed to reset secret."
                  }
                );
              }}>
              <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 data-[syncing=true]:animate-spin" data-syncing={resettingSecret} />
              Reset Secret
            </Button>
          </div>
          {#if appSecret}
            <div transition:slide={{ duration: 300, easing: cubicOut }}>
              <Alert.Root>
                <Alert.Title class="text-lg">Heads up!</Alert.Title>
                <Alert.Description>
                  Make sure to store your app secret securely. You won't be able to see it again after this page.
                  <br /> <br />
                  If you lose it, you will need to reset it.
                </Alert.Description>
              </Alert.Root>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
  <Form.Field form={appForm} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>App Name</Form.Label>
        <Form.Description>This is the name of your app, it will be displayed in the dashboard.</Form.Description>
        <Input {...props} bind:value={$appFormData.name} maxlength={32} type="text" autocomplete="off" />
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Field form={appForm} name="uri">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>URI</Form.Label>
        <Form.Description>This is the URI to your app's website or homepage. It will be displayed in the dashboard and used in the OAuth2 flow.</Form.Description>
        <Input {...props} bind:value={$appFormData.uri} type="url" autocomplete="url" />
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Accordion.Root type="single">
    <Accordion.Item value="redirect-uris">
      <Accordion.Trigger class={cn({ "text-destructive": $appErrors.redirectUris })}>Redirect URIs</Accordion.Trigger>
      <Accordion.Content>
        <Form.Fieldset form={appForm} name="redirectUris">
          <Form.Description>These are the URIs that your app can redirect to after a user authorizes it. Make sure to include all the URIs that your app will use.</Form.Description>
          {#each $appFormData.redirectUris as _, i (i)}
            <Form.ElementField form={appForm} name="redirectUris[{i}]">
              <Form.Control>
                {#snippet children({ props })}
                  <div class="relative" transition:slide={{ axis: "y", duration: 300 }}>
                    <Input {...props} bind:value={$appFormData.redirectUris[i]} class="relative" placeholder="http://localhost:3000/cb" />
                    <Button type="button" variant="link" size="sm" class="group absolute top-1/2 right-2 h-auto -translate-y-1/2 transform p-0 text-destructive" onclick={() => ($appFormData.redirectUris = $appFormData.redirectUris.filter((_, j) => j !== i))}>
                      <CircleMinus class="opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                    </Button>
                  </div>
                  <Form.FieldErrors variant="single" />
                {/snippet}
              </Form.Control>
            </Form.ElementField>
          {/each}

          {#if $appErrors.redirectUris}
            <Form.FieldErrors />
          {/if}

          {#if $appFormData.redirectUris && $appFormData.redirectUris.every((url) => url !== "")}
            {#if $appFormData.redirectUris.length === 0 || !urlErrors}
              <div transition:slide>
                <Button type="button" variant="outline" size="sm" class="mt-2" onclick={addUrl}>Add URL</Button>
              </div>
            {/if}
          {:else}
            <Form.Description class="text-sm text-muted-foreground">Please fill in all the URIs before adding a new one.</Form.Description>
          {/if}
        </Form.Fieldset>
      </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="contact-emails">
      <Accordion.Trigger class={cn({ "text-destructive": $appErrors.contacts })}>Contact Emails</Accordion.Trigger>
      <Accordion.Content>
        <Form.Fieldset form={appForm} name="contacts">
          <Form.Description>These are the email addresses that we can use to contact you about your app. They will not be shared with users.</Form.Description>
          {#each $appFormData.contacts as _, i (i)}
            <Form.ElementField form={appForm} name="contacts[{i}]">
              <Form.Control>
                {#snippet children({ props })}
                  <div class="relative" transition:slide={{ axis: "y", duration: 300 }}>
                    <Input {...props} bind:value={$appFormData.contacts[i]} class="relative" placeholder="contact@example.com" />
                    <Button type="button" variant="link" size="sm" class="group absolute top-1/2 right-2 h-auto -translate-y-1/2 transform p-0 text-destructive" onclick={() => ($appFormData.contacts = $appFormData.contacts.filter((_, j) => j !== i))}>
                      <CircleMinus class="opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                    </Button>
                  </div>
                {/snippet}
              </Form.Control>
              <Form.FieldErrors variant="single" />
            </Form.ElementField>
          {/each}

          {#if contactErrors}
            <Form.FieldErrors />
          {/if}

          {#if $appFormData.contacts && $appFormData.contacts.every((url) => url !== "")}
            {#if $appFormData.contacts.length === 0 || !contactErrors}
              <div transition:slide>
                <Button type="button" variant="outline" size="sm" class="mt-2" onclick={addContact}>Add contact</Button>
              </div>
            {/if}
          {:else}
            <Form.Description class="text-sm text-muted-foreground">Please fill in all the contacts before adding a new one.</Form.Description>
          {/if}
        </Form.Fieldset>
      </Accordion.Content>
    </Accordion.Item>

    <Accordion.Item value="scopes">
      <Accordion.Trigger class={cn({ "text-destructive": $appErrors.scopes })}>Scopes</Accordion.Trigger>
      <Accordion.Content>
        <Form.Fieldset form={appForm} name="scopes" class="space-y-0">
          <div class="mb-4">
            <Form.Description>Select the scopes that your app will request</Form.Description>
          </div>
          <div class="space-y-2">
            {#each scopes as scope (scope.value)}
              {@const checked = $appFormData.scopes.includes(scope.value)}
              <div class="flex flex-row items-start space-x-3">
                <Form.Control>
                  {#snippet children({ props })}
                    <Checkbox
                      {...props}
                      {checked}
                      value={scope.value}
                      onCheckedChange={(v) => {
                        if (v) {
                          addItem(scope.value);
                        } else {
                          removeItem(scope.value);
                        }
                      }} />
                    <div class="space-y-1">
                      <Form.Label class="font-normal">
                        {scope.label}
                      </Form.Label>
                      <Form.Description class="text-sm text-muted-foreground">
                        {scope.description}
                      </Form.Description>
                    </div>
                  {/snippet}
                </Form.Control>
              </div>
            {/each}
            <Form.FieldErrors />
          </div>
        </Form.Fieldset>
      </Accordion.Content>
    </Accordion.Item>

    <Accordion.Item value="metadata">
      <Accordion.Trigger class={cn({ "text-destructive": $appErrors.description || $appErrors.tosUri || $appErrors.policyUri })}>Metadata</Accordion.Trigger>
      <Accordion.Content class="space-y-4">
        <Form.Field form={appForm} name="description">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label for={props.name}>Description</Form.Label>
              <Form.Description>This is a short description of your app, it will be displayed in the dashboard.</Form.Description>
              <Textarea {...props} class="resize-none" bind:value={$appFormData.description} bind:ref={textAreaEl} autocomplete="off" placeholder="Describe your app in a few words" />
              <Form.FieldErrors variant="single" />
            {/snippet}
          </Form.Control>
        </Form.Field>
        <Form.Field form={appForm} name="logoUrl">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label for={props.name}>Logo URL</Form.Label>
              <Form.Description>This is the URL to your app's logo.</Form.Description>
              <Input {...props} bind:value={$appFormData.logoUrl} type="url" autocomplete="url" />
              <Form.FieldErrors variant="single" />
            {/snippet}
          </Form.Control>
        </Form.Field>
        <Form.Field form={appForm} name="tosUri">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label for={props.name}>Terms of Service URL</Form.Label>
              <Form.Description>This is the URL to your app's terms of service.</Form.Description>
              <Input {...props} bind:value={$appFormData.tosUri} type="url" autocomplete="url" />
              <Form.FieldErrors variant="single" />
            {/snippet}
          </Form.Control>
        </Form.Field>
        <Form.Field form={appForm} name="policyUri">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label for={props.name}>Privacy Policy URL</Form.Label>
              <Form.Description>This is the URL to your app's privacy policy.</Form.Description>
              <Input {...props} bind:value={$appFormData.policyUri} type="url" autocomplete="url" />
              <Form.FieldErrors variant="single" />
            {/snippet}
          </Form.Control>
        </Form.Field>
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>

  <Form.Button disabled={!appIsTainted($appTainted) || urlErrors || contactErrors || $appSubmitting || (isCreate && !emailVerified)} class="capitalize transition-all duration-300" variant={!appIsTainted($appTainted) || urlErrors || contactErrors || $appSubmitting || (isCreate && !emailVerified) ? "secondary" : "default"}>
    {#if !$appSubmitting}
      Save
    {:else}
      <LoaderCircle class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>

{#if !isCreate}
  <form
    method="POST"
    action="?/deleteApp"
    use:deleteAppEnhance={{
      onSubmit: async () => {
        toastLoading = toast.loading("Deleting your app...");
      },
      onResult: async () => {
        setTimeout(() => toast.dismiss(toastLoading), 300);
      },
      onUpdate: async ({ result }) => {
        if (result.type === "success") {
          toast.success("App deleted successfully!");
        } else {
          toast.error("Failed to delete your app. Please try again.");
        }
      },
      onError: async () => {
        toast.error("An error occurred while deleting your app. Please try again.");
      }
    }}
    class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
    <Form.Field form={deleteAppForm} name="id" class="hidden">
      <Form.Control>
        {#snippet children({ props })}
          <Input {...props} value={$deleteAppFormData.id} readonly type="url" autocomplete="url" />
        {/snippet}
      </Form.Control>
    </Form.Field>

    <Form.Button disabled={$deleteAppSubmitting} class="mt-2 capitalize transition-all duration-300" variant="destructive">
      {#if !$deleteAppSubmitting}
        Delete App
      {:else}
        <LoaderCircle class="h-4 w-4 animate-spin" />
      {/if}
    </Form.Button>
  </form>
{/if}
