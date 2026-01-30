<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$ui/button";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import { toast } from "svelte-sonner";

  const { id }: { id: string } = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <EllipsisIcon />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Actions</DropdownMenu.Label>
      <DropdownMenu.Item>
        {#snippet child({ props })}
          <a href={resolve("/(protected)/dashboard/(admin)/admin/oauth-apps/[oauthAppID]", { oauthAppID: id })} {...props}> View OAuth App </a>
        {/snippet}
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item onclick={() => toast.promise(navigator.clipboard.writeText(id), { loading: "Copying OAuth App ID...", success: "OAuth App ID copied to clipboard", error: "Failed to copy OAuth App ID" })}>Copy OAuth App ID</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
