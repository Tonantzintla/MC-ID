<script lang="ts">
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import { cn } from "$lib/utils";
  import { lastSynced } from "$stores/internal";
  import { Button, buttonVariants } from "$ui/button";
  import * as Form from "$ui/form";
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import * as Tooltip from "$ui/tooltip";
  import { tz } from "@date-fns/tz";
  import BadgeCheck from "@lucide/svelte/icons/badge-check";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import Mail from "@lucide/svelte/icons/mail";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { formatDistanceStrict } from "date-fns";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zod4Client as zodClient } from "sveltekit-superforms/adapters";
  import { profileUpdateSchema, type ProfileUpdateSchema } from "./schema";
  import { serverDate, syncUser } from "./sync.remote";

  const { data }: { data: { profileUpdateForm: SuperValidated<Infer<ProfileUpdateSchema>> } } = $props();

  const session = authClient.useSession();
  const emailVerified = $derived($session.data?.user?.emailVerified ?? false);

  const form = superForm(data.profileUpdateForm, {
    validators: zodClient(profileUpdateSchema),
    dataType: "json",
    timeoutMs: 2000,
    validationMethod: "onblur",
    resetForm: false
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = form;

  const serverDateResult = $derived(await serverDate());
  let syncDisabled = $derived(!page.data.primaryMcAccount.username && $lastSynced && new Date(serverDateResult.data).getTime() - $lastSynced.getTime() < 3 * 24 * 60 * 60 * 1000);
  let username = $state<string>(page.data.primaryMcAccount.username ?? $formData.name);
  let toastLoading = $state<number | string>();
  let syncingUser = $state<boolean>(false);
  let sendingVerification = $state<boolean>(false);
  let verificationRateLimitExpiry = $state<number | null>(null);
  let remainingTime = $state<string>("");

  const VERIFICATION_RATE_LIMIT_KEY = "email_verification_last_sent";
  const RATE_LIMIT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  onMount(() => {
    // Check localStorage for rate limit
    const lastSent = localStorage.getItem(VERIFICATION_RATE_LIMIT_KEY);
    if (lastSent) {
      const lastSentTime = parseInt(lastSent);
      const expiryTime = lastSentTime + RATE_LIMIT_DURATION;
      const now = Date.now();

      if (now < expiryTime) {
        verificationRateLimitExpiry = expiryTime;
      } else {
        // Expired, clean up
        localStorage.removeItem(VERIFICATION_RATE_LIMIT_KEY);
      }
    }

    // Update remaining time every second
    const interval = setInterval(() => {
      if (verificationRateLimitExpiry) {
        const now = Date.now();
        const diff = verificationRateLimitExpiry - now;

        if (diff <= 0) {
          verificationRateLimitExpiry = null;
          localStorage.removeItem(VERIFICATION_RATE_LIMIT_KEY);
          remainingTime = "";
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          remainingTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  const handleSendVerification = async () => {
    sendingVerification = true;

    try {
      if (!$session.data?.user?.email) throw new Error("No email associated with the user.");

      await authClient.sendVerificationEmail({
        email: $session.data.user.email,
        callbackURL: "/dashboard/settings/profile" // The redirect URL after verification
      });
      toast.success("Verification email sent!", {
        description: "Please check your inbox for the verification link."
      });

      // Set rate limit
      const now = Date.now();
      localStorage.setItem(VERIFICATION_RATE_LIMIT_KEY, now.toString());
      verificationRateLimitExpiry = now + RATE_LIMIT_DURATION;
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email", {
        description: "Please try again later."
      });
    } finally {
      sendingVerification = false;
    }
  };

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to update your profile...", {
        id: toastLoading
      });
    }
  });
</script>

<form
  method="POST"
  action="?/updateEmail"
  use:enhance={{
    onSubmit: async () => {
      toastLoading = toast.loading("Updating your email...");
    },
    onResult: async () => {
      setTimeout(() => toast.dismiss(toastLoading), 300);
    },
    onUpdate: async ({ result }) => {
      if (result.type === "success") {
        toast.success("Updated your email successfully!");
      } else {
        toast.error(result.data.error ?? "Failed to update your email.");
      }
    },
    onError: async () => {
      toast.error("Something went wrong while trying to update your email.");
    }
  }}
  class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  {#if page.data.primaryMcAccount}
    <div class="space-y-2">
      <Label for="username">Minecraft account</Label>
      <div class="text-sm text-muted-foreground">You can edit your Minecraft account on <Button href="https://www.minecraft.net/profile" target="_blank" variant="link" class="inline h-auto p-0">minecraft.net</Button>.</div>
      <div class="flex gap-4">
        <Input value={username} disabled readonly maxlength={16} type="text" autocomplete="username" />
        {#if syncDisabled}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <div {...props} class={cn("cursor-not-allowed opacity-50 hover:bg-secondary!", buttonVariants({ variant: "secondary", size: "default" }))}>
                  <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 data-[syncing=true]:animate-spin" data-syncing={syncingUser} />
                  Sync
                </div>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>
              You can sync again
              {formatDistanceStrict(new Date(new Date(serverDateResult.data).getTime() + 3 * 24 * 60 * 60 * 1000), $lastSynced, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}
            </Tooltip.Content>
          </Tooltip.Root>
        {:else}
          <Button
            class="group"
            variant="secondary"
            type="button"
            disabled={syncingUser || $submitting}
            onclick={() => {
              if (syncDisabled) return;
              syncingUser = true;
              toast.promise(
                new Promise((resolve, reject) => {
                  syncUser(page.data.primaryMcAccount.uuid ?? $formData.uuid)
                    .then(({ data, success, message }) => {
                      if (!success) throw new Error(message ?? "Failed to sync user.");
                      username = data.name;
                      lastSynced.set(new Date(serverDateResult.data));
                      resolve(data);
                    })
                    .catch(reject)
                    .finally(() => {
                      syncingUser = false;
                    });
                }),
                {
                  loading: "Syncing...",
                  success: "Synced successfully!",
                  error: "Something went wrong while syncing.",
                  duration: 3000,
                  onDismiss: () => {
                    toast.info("Your username has been synced with your Minecraft account.", {
                      description: "Please wait a few minutes for the skin to update if it has changed.",
                      duration: 5000
                    });
                  }
                }
              );
            }}>
            <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 data-[syncing=true]:animate-spin" data-syncing={syncingUser} />
            Sync
          </Button>
        {/if}
      </div>
    </div>
  {/if}
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <div class="flex items-center gap-2">
          <Form.Label for={props.name}>Email</Form.Label>
          {#if emailVerified}
            <span class="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              <BadgeCheck class="h-3 w-3" />
              Verified
            </span>
          {/if}
        </div>
        <Form.Description>This is only used for password recovery.</Form.Description>
        <div class="flex gap-2">
          <Input {...props} bind:value={$formData.email} type="email" autocomplete="email" class="flex-1" />
          {#if !emailVerified}
            {#if verificationRateLimitExpiry}
              <Tooltip.Root>
                <Tooltip.Trigger>
                  {#snippet child({ props: tooltipProps })}
                    <div {...tooltipProps} class={cn("cursor-not-allowed opacity-50", buttonVariants({ variant: "secondary", size: "default" }))}>
                      <Mail class="h-4 w-4" />
                      Verify
                    </div>
                  {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content>
                  Please wait {remainingTime} before sending another verification email
                </Tooltip.Content>
              </Tooltip.Root>
            {:else}
              <Button type="button" variant="secondary" disabled={sendingVerification || $submitting} onclick={handleSendVerification}>
                {#if sendingVerification}
                  <LoaderCircle class="h-4 w-4 animate-spin" />
                {:else}
                  <Mail class="h-4 w-4" />
                {/if}
                Verify
              </Button>
            {/if}
          {/if}
        </div>
        <Form.FieldErrors variant="single" />
      {/snippet}
    </Form.Control>
  </Form.Field>

  <Form.Button disabled={!isTainted($tainted) || $submitting || syncingUser} class="transition-all duration-300" variant={!isTainted($tainted) ? "secondary" : "default"}>
    {#if !$submitting}
      Update Profile
    {:else}
      <LoaderCircle class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
