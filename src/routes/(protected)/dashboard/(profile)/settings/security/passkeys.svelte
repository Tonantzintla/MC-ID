<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { Button } from "$ui/button";
  import { Input } from "$ui/input";
  import { Label } from "$ui/label";
  import { CircleMinus, Key } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { slide } from "svelte/transition";
  import { deletePasskey, getPasskeys, updatePasskey } from "./passkeys.remote";

  let newPasskeyName = $state<string>();
  let changingPasskeys = $state<boolean>(false);
</script>

<div class="relative mx-auto flex h-1/2 flex-col justify-center space-y-4 self-center px-4 md:px-0">
  <div class="space-y-2">
    <Label for="passkeys">Passkeys</Label>
    <p class="text-sm text-muted-foreground">Passkeys are a secure and convenient way to log in without passwords. They use cryptographic keys stored on your device, making them resistant to phishing and other attacks.</p>

    <div class="space-y-2">
      <svelte:boundary>
        {#each await getPasskeys() as passkey (passkey.id)}
          <div class="relative" transition:slide={{ axis: "y", duration: 300 }}>
            <Key class="absolute top-1/2 left-2 z-10 size-6 -translate-y-1/2 rounded-full bg-accent p-1 select-none" />
            <Input
              bind:value={passkey.name}
              class="no-input-borders relative pl-10"
              onchange={() => {
                changingPasskeys = true;
                toast.promise(
                  new Promise((resolve, reject) => {
                    updatePasskey({ id: passkey.id, name: passkey.name ?? "Unnamed Passkey" })
                      .then(resolve)
                      .catch(reject)
                      .finally(() => {
                        changingPasskeys = false;
                      });
                  }),
                  {
                    loading: "Changing passkey name...",
                    success: "Passkey name changed successfully!",
                    error: "Failed to change passkey name"
                  }
                );
              }} />
            <Button
              type="button"
              variant="link"
              size="sm"
              class="group absolute top-1/2 right-2 h-auto -translate-y-1/2 transform p-0"
              onclick={() => {
                changingPasskeys = true;
                toast.promise(
                  new Promise((resolve, reject) => {
                    deletePasskey(passkey.id)
                      .then(resolve)
                      .catch(reject)
                      .finally(async () => {
                        await getPasskeys().refresh();
                        changingPasskeys = false;
                      });
                  }),
                  {
                    loading: "Deleting passkey...",
                    success: "Passkey deleted successfully!",
                    error: "Failed to delete passkey"
                  }
                );
              }}
              aria-label="Delete Passkey">
              <CircleMinus class="text-destructive opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          </div>
        {/each}

        {#snippet pending()}
          <div class="h-9 w-full animate-pulse rounded-md border border-input bg-input/30 shadow-xs"></div>
        {/snippet}

        {#snippet failed()}
          <div class="text-destructive">Failed to load passkeys. Please try again later.</div>
        {/snippet}
      </svelte:boundary>
    </div>

    <div class="flex items-center space-x-2">
      <Input bind:value={newPasskeyName} placeholder="Enter passkey name" id="passkeys" class="w-full" />

      <Button
        disabled={changingPasskeys || !newPasskeyName}
        onclick={async () => {
          changingPasskeys = true;
          toast.promise(
            authClient.passkey
              .addPasskey({
                name: newPasskeyName ?? "Unnamed Passkey"
              })
              .then((res) => {
                if (res) {
                  const { data: _data, error } = res;
                  if (error) {
                    console.error("Failed to add passkey:", error);
                    throw new Error(error.message);
                  }
                }
              })
              .finally(async () => {
                newPasskeyName = undefined!;
                await getPasskeys().refresh();
                changingPasskeys = false;
              }),
            {
              loading: "Adding passkey...",
              success: "Passkey added successfully!",
              error: "Failed to add passkey",
              finally: async () => {
                changingPasskeys = false;
                newPasskeyName = undefined!;
              }
            }
          );
        }}>Add Passkey</Button>
    </div>
  </div>
</div>
