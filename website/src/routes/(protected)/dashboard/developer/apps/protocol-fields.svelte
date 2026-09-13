<script lang="ts">
  import * as Accordion from "$ui/accordion";
  import * as Alert from "$ui/alert";
  import { Button } from "$ui/button";
  import { Checkbox } from "$ui/checkbox";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import * as Select from "$ui/select";
  import { Textarea } from "$ui/textarea";
  import { untrack } from "svelte";
  import type { Infer, SuperForm } from "sveltekit-superforms";
  import type { AppSchema } from "./schema";

  const { appForm, isEdit }: { appForm: SuperForm<Infer<AppSchema>>; isEdit: boolean } = $props();
  const { form, errors } = untrack(() => appForm);
  const applicationTypes = [
    { value: "web", label: "Web application" },
    { value: "native", label: "Native application" }
  ];
  const authMethods = [
    { value: "client_secret_basic", label: "Client secret — HTTP Basic" },
    { value: "client_secret_post", label: "Client secret — POST body" },
    { value: "none", label: "Public client — no secret" },
    { value: "private_key_jwt", label: "Private key JWT" }
  ];
  const selectedApplicationType = $derived(
    applicationTypes.find((item) => item.value === $form.applicationType)?.label
  );
  const selectedAuthMethod = $derived(authMethods.find((item) => item.value === $form.tokenEndpointAuthMethod)?.label);
</script>

<Accordion.Root type="multiple" value={["authentication"]}>
  <Accordion.Item value="authentication">
    <Accordion.Trigger>Client authentication</Accordion.Trigger>
    <Accordion.Content class="flex flex-col gap-4">
      <Form.Field form={appForm} name="applicationType">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Application type</Form.Label>
            <Select.Root type="single" bind:value={$form.applicationType}>
              <Select.Trigger {...props} class="w-full">{selectedApplicationType}</Select.Trigger>
              <Select.Content
                ><Select.Group>
                  {#each applicationTypes as item (item.value)}
                    <Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
                  {/each}
                </Select.Group></Select.Content>
            </Select.Root>
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field form={appForm} name="tokenEndpointAuthMethod">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Token endpoint authentication</Form.Label>
            <Select.Root
              type="single"
              bind:value={$form.tokenEndpointAuthMethod}
              disabled={isEdit}
              onValueChange={(value) => {
                if (value && value !== "private_key_jwt" && !isEdit) {
                  $form.jwks = "";
                  $form.jwksUri = "";
                }
              }}>
              <Select.Trigger {...props} class="w-full">{selectedAuthMethod}</Select.Trigger>
              <Select.Content
                ><Select.Group>
                  {#each authMethods as item (item.value)}
                    <Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
                  {/each}
                </Select.Group></Select.Content>
            </Select.Root>
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <p class="text-sm text-muted-foreground">
        Use HTTP Basic for a server that can keep a secret. Browser and mobile apps should use a public client.
        Configure your OAuth library to use the exact authentication method selected here.
      </p>
      {#if isEdit}
        <p class="text-sm text-muted-foreground">
          Authentication method and public key source are fixed at registration. Create a new app to change them.
        </p>
      {/if}
      {#if $form.tokenEndpointAuthMethod === "private_key_jwt"}
        <Form.Field form={appForm} name="jwks">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Public JWKS</Form.Label>
              <Form.Description
                >Provide a JSON Web Key Set containing only public signing keys, or a JWKS URL below. Keep private keys
                on your server.</Form.Description>
              <Textarea {...props} bind:value={$form.jwks} disabled={isEdit} rows={5} autocomplete="off" />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field form={appForm} name="jwksUri">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>JWKS URL</Form.Label>
              <Form.Description
                >Alternative to pasted keys. Requires an HTTPS origin trusted by the MC-ID operator.</Form.Description>
              <Input {...props} bind:value={$form.jwksUri} disabled={isEdit} type="url" />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      {/if}
      <Alert.Root>
        <Alert.Title>Authorization code with PKCE</Alert.Title>
        <Alert.Description
          >All apps require PKCE using S256. The response type is code and the OpenID subject type is public. Client
          credentials and device authorization are not enabled.</Alert.Description>
      </Alert.Root>
      <Form.Fieldset form={appForm} name="grantTypes">
        <Form.Legend>Grant types</Form.Legend>
        <Form.Description
          >Authorization code is required. Enable refresh tokens only when you also select the offline_access scope.</Form.Description>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Checkbox id="grant-code" checked disabled /><label for="grant-code">Authorization code</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              id="grant-refresh"
              checked={$form.grantTypes.includes("refresh_token")}
              aria-invalid={!!$errors.grantTypes}
              onCheckedChange={(checked) => {
                $form.grantTypes = checked ? ["authorization_code", "refresh_token"] : ["authorization_code"];
              }} />
            <label for="grant-refresh">Refresh token</label>
          </div>
        </div>
        <Form.FieldErrors />
      </Form.Fieldset>
      <Form.Field form={appForm} name="dpopBoundAccessTokens">
        <Form.Control
          >{#snippet children({ props })}
            <div class="flex items-center gap-2">
              <Checkbox {...props} bind:checked={$form.dpopBoundAccessTokens} /><Form.Label>Require DPoP</Form.Label>
            </div>
            <Form.Description
              >Only enable this if your client sends DPoP proofs when requesting and using tokens.</Form.Description>
          {/snippet}</Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="logout">
    <Accordion.Trigger>Logout</Accordion.Trigger>
    <Accordion.Content class="flex flex-col gap-4">
      <Form.Fieldset form={appForm} name="postLogoutRedirectUris">
        <Form.Legend>Post-logout redirect URIs</Form.Legend>
        <Form.Description
          >Allowed destinations after a user signs out through the OpenID logout endpoint. An administrator must enable
          end-session support for your app.</Form.Description>
        {#each $form.postLogoutRedirectUris as _, i (i)}
          <Form.ElementField form={appForm} name="postLogoutRedirectUris[{i}]">
            <Form.Control
              >{#snippet children({ props })}
                <Form.Label>Logout redirect URI {i + 1}</Form.Label>
                <div class="flex gap-2">
                  <Input {...props} bind:value={$form.postLogoutRedirectUris[i]} type="url" />
                  <Button
                    type="button"
                    variant="outline"
                    onclick={() => {
                      $form.postLogoutRedirectUris = $form.postLogoutRedirectUris.filter((_, index) => index !== i);
                    }}>Remove</Button>
                </div>
              {/snippet}</Form.Control>
            <Form.FieldErrors />
          </Form.ElementField>
        {/each}
        <Form.FieldErrors />
        <Button
          type="button"
          variant="outline"
          onclick={() => {
            $form.postLogoutRedirectUris = [...$form.postLogoutRedirectUris, ""];
          }}>Add logout URI</Button>
      </Form.Fieldset>
      <Form.Field form={appForm} name="backchannelLogoutUri">
        <Form.Control
          >{#snippet children({ props })}
            <Form.Label>Back-channel logout URL</Form.Label>
            <Form.Description
              >Your public HTTPS endpoint for signed logout notifications. Leave empty if your app does not handle them.</Form.Description>
            <Input {...props} bind:value={$form.backchannelLogoutUri} type="url" />
          {/snippet}</Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field form={appForm} name="backchannelLogoutSessionRequired">
        <Form.Control
          >{#snippet children({ props })}
            <Form.Label>Include session ID in logout notifications</Form.Label>
            <Form.Description>Request the session identifier (sid) in backchannel logout tokens.</Form.Description>
            <Checkbox {...props} bind:checked={$form.backchannelLogoutSessionRequired} />
          {/snippet}</Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="software">
    <Accordion.Trigger>Software metadata</Accordion.Trigger>
    <Accordion.Content class="flex flex-col gap-4">
      <Form.Field form={appForm} name="softwareId">
        <Form.Control
          >{#snippet children({ props })}
            <Form.Label>Software ID</Form.Label>
            <Input {...props} bind:value={$form.softwareId} autocomplete="off" />
          {/snippet}</Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field form={appForm} name="softwareVersion">
        <Form.Control
          >{#snippet children({ props })}
            <Form.Label>Software version</Form.Label>
            <Input {...props} bind:value={$form.softwareVersion} autocomplete="off" />
          {/snippet}</Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
