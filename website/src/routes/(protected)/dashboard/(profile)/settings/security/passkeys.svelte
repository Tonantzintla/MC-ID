<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$ui/button";
  import { Input } from "$ui/input";
  import * as InputGroup from "$ui/input-group";
  import { Label } from "$ui/label";
  import { Skeleton } from "$ui/skeleton";
  import { CircleMinus, Key } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { slide } from "svelte/transition";
  import { deletePasskey, getPasskeys, updatePasskey } from "./passkeys.remote";

  let newPasskeyName = $state("");
  let changingPasskeys = $state(false);

  async function changePasskey(action: () => Promise<unknown>, loading: string, success: string) {
    if (changingPasskeys) return;
    changingPasskeys = true;
    const toastId = toast.loading(loading);
    try {
      await action();
      toast.success(success, { id: toastId });
    } catch {
      toast.error("Could not update your passkeys. Please try again.", { id: toastId });
    } finally {
      changingPasskeys = false;
    }
  }

  async function addPasskey() {
    const result = await authClient.passkey.addPasskey({ name: newPasskeyName.trim() });
    if (!result?.data || result.error) throw new Error(result?.error?.message ?? "Passkey was not created");
    newPasskeyName = "";
    await getPasskeys().refresh();
  }
</script>

<div class="relative mx-auto flex flex-col justify-center gap-4 self-center px-4 md:px-0">
  <div class="flex flex-col gap-2">
    <Label for="passkeys">Passkeys</Label>
    <p class="text-sm text-muted-foreground">
      Passkeys are a secure and convenient way to log in without passwords. They use cryptographic keys stored on your
      device, making them resistant to phishing and other attacks.
    </p>

    <div class="flex flex-col gap-2">
      <svelte:boundary>
        {#each await getPasskeys() as passkey (passkey.id)}
          <div transition:slide={{ axis: "y", duration: 300 }}>
            <InputGroup.Root>
              <InputGroup.Input
                value={passkey.name ?? ""}
                aria-label="Passkey name"
                disabled={changingPasskeys}
                onchange={(event) => {
                  const input = event.currentTarget;
                  const name = input.value.trim() || "Unnamed Passkey";
                  void changePasskey(
                    async () => {
                      try {
                        await updatePasskey({ id: passkey.id, name });
                      } catch (error) {
                        input.value = passkey.name ?? "";
                        throw error;
                      }
                    },
                    "Changing passkey name...",
                    "Passkey name changed successfully!"
                  );
                }} />
              <InputGroup.Addon><Key /></InputGroup.Addon>
              <InputGroup.Addon align="inline-end">
                <InputGroup.Button
                  disabled={changingPasskeys}
                  size="icon-sm"
                  onclick={() =>
                    changePasskey(
                      () => deletePasskey(passkey.id),
                      "Deleting passkey...",
                      "Passkey deleted successfully!"
                    )}
                  aria-label="Delete passkey">
                  <CircleMinus />
                </InputGroup.Button>
              </InputGroup.Addon>
            </InputGroup.Root>
          </div>
        {/each}

        {#snippet pending()}
          <Skeleton class="h-9 w-full" />
        {/snippet}
        {#snippet failed()}
          <p class="text-destructive">Failed to load passkeys. Please try again later.</p>
        {/snippet}
      </svelte:boundary>
    </div>

    <div class="flex items-center gap-2">
      <Input
        bind:value={newPasskeyName}
        disabled={changingPasskeys}
        placeholder="Enter passkey name"
        id="passkeys"
        class="w-full" />
      <Button
        disabled={changingPasskeys || !newPasskeyName.trim()}
        onclick={() => changePasskey(addPasskey, "Adding passkey...", "Passkey added successfully!")}
        >Add Passkey</Button>
    </div>
  </div>
</div>
