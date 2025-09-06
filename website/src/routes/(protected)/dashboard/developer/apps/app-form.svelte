<script lang="ts">
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
  import { botttsNeutral } from "@dicebear/collection";
  import { createAvatar } from "@dicebear/core";
  import { CircleQuestionMark } from "@lucide/svelte";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { TextareaAutosize } from "runed";
  import { toast } from "svelte-sonner";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { resetSecret } from "./[id=dev_app_id]/reset.remote";
  import { appSchema, type AppSchema } from "./schema";
  import { AppFormVariant, type DeveloperApp } from "./types.d";

  const { data, variant }: { data: { appForm: SuperValidated<Infer<AppSchema>>; appData?: DeveloperApp }; variant: AppFormVariant } = $props();
  const { appData } = data;

  const isCreate = variant == (AppFormVariant.CREATE as const);
  const isEdit = variant == (AppFormVariant.EDIT as const);

  const language = {
    action: isCreate ? "creating" : "editing",
    success: isCreate ? "created" : "updated",
    normal: isCreate ? "create" : "edit"
  } as const;

  const form = superForm(data.appForm, {
    validators: zodClient(appSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "oninput",
    invalidateAll: isEdit ? "pessimistic" : undefined
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = form;

  let toastLoading = $state<number | string>();
  let textAreaEl = $state<HTMLTextAreaElement>(null!);
  let appSecret = $state<string>();
  let resettingSecret = $state<boolean>(false);

  const avatar = createAvatar(botttsNeutral, {
    size: 128,
    seed: appData?.id ?? "default-avatar"
  }).toDataUri();

  new TextareaAutosize({
    element: () => textAreaEl,
    input: () => $formData.description ?? "",
    maxHeight: 200
  });

  timeout.subscribe((value) => {
    if (value) {
      toast.loading(`It's taking longer than expected to ${language.normal} your app...`, {
        id: toastLoading
      });
    }
  });
</script>

<form
  method="POST"
  action={isCreate ? "?/createApp" : `?/editApp`}
  use:enhance={{
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
          form.reset();
        }
        toast.error(`Failed to ${language.normal} app. Please check the form for errors.`);
      }
    },
    onError: async () => {
      if (isEdit) {
        form.reset();
      }
      toast.error(`An error occurred while ${language.action} your app. Please try again.`);
    }
  }}
  class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  {#if isEdit}
    <div class="flex items-center justify-center">
      <Avatar.Root class="pointer-events-none flex h-16 w-16 items-center justify-center select-none">
        <Avatar.Image src={avatar} alt="App Avatar" class="h-16 w-16 rounded-full" />
        <Avatar.Fallback>{$formData.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
    </div>

    {#if $formData}
      <div class="flex flex-col gap-4">
        {#if $formData.id}
          <Form.Field {form} name="id">
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
                <CopyButton text={$formData.id ?? "No ID"} size="default" variant="outline" class="w-full justify-start" id={props.name}>
                  <span class="font-mono text-sm font-light">{$formData.id}</span>
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
              disabled={resettingSecret || $submitting}
              onclick={() => {
                resettingSecret = true;
                toast.promise(
                  new Promise((resolve, reject) => {
                    if (!$formData.id) {
                      reject(new Error("App ID is required to reset the secret."));
                      return;
                    }
                    resetSecret($formData.id)
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
  <Form.Field {form} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>App Name</Form.Label>
        <Form.Description>This is the name of your app, it will be displayed in the dashboard.</Form.Description>
        <Input {...props} bind:value={$formData.name} maxlength={32} type="text" autocomplete="off" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Field {form} name="website">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Website</Form.Label>
        <Form.Description>This is the URL of your app, it will be used for OAuth redirects and other purposes.</Form.Description>
        <Input {...props} bind:value={$formData.website} type="url" autocomplete="url" />
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Field {form} name="description">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Description</Form.Label>
        <Form.Description>This is a short description of your app, it will be displayed in the dashboard.</Form.Description>
        <Textarea {...props} class="resize-none" bind:value={$formData.description} bind:ref={textAreaEl} autocomplete="off" placeholder="Describe your app in a few words" />
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Button disabled={!isTainted($tainted) || $submitting} class="capitalize transition-all duration-300" variant={!isTainted($tainted) ? "secondary" : "default"}>
    {#if !$submitting}
      {language.normal} App
    {:else}
      <LoaderCircle class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
