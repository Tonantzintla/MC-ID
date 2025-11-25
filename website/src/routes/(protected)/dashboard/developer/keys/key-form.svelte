<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { keySchema, type KeySchema } from "./schema";

  const { data }: { data: { keyForm: SuperValidated<Infer<KeySchema>> } } = $props();

  let toastLoading = $state<number | string>();

  const session = authClient.useSession();
  const emailVerified = $derived($session.data?.user?.emailVerified ?? false);

  const keyForm = superForm(data.keyForm, {
    validators: zodClient(keySchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "onblur"
  });

  const { form: keyFormData, enhance: keyEnhance, tainted: keyTainted, isTainted: keyIsTainted, submitting: keySubmitting, timeout: keyTimeout, errors: keyErrors } = keyForm;

  const buttonDisabled = $derived(!keyIsTainted($keyTainted) || $keySubmitting || !emailVerified || ($keyErrors.name?.length ?? 0) > 0);

  keyTimeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to create your key...", {
        id: toastLoading
      });
    }
  });
</script>

<form
  method="POST"
  action="?/createKey"
  data-disabled={!emailVerified}
  use:keyEnhance={{
    onSubmit: async () => {
      toastLoading = toast.loading("Creating your key...");
    },
    onResult: async () => {
      setTimeout(() => toast.dismiss(toastLoading), 300);
    },
    onUpdate: async ({ result }) => {
      console.info(result);
      if (result.type === "success") {
        toast.success("Key created successfully!");
      } else {
        toast.error("Failed to create your key. Please check the form for errors.");
      }
    },
    onError: async () => {
      toast.error("An error occurred while creating your key. Please try again.");
    }
  }}
  class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  <Form.Field form={keyForm} name="name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label for={props.name}>Key Name</Form.Label>
        <Form.Description>This is the name of your API key. It will be displayed in the dashboard.</Form.Description>
        <Input {...props} bind:value={$keyFormData.name} maxlength={32} type="text" autocomplete="off" />
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Button disabled={buttonDisabled} class="capitalize transition-all duration-300" variant={buttonDisabled ? "secondary" : "default"}>
    {#if !$keySubmitting}
      Create Key
    {:else}
      <LoaderCircle class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
