<script lang="ts">
  import { resolve } from "$app/paths";
  import { DateTooltip } from "$components/data-table";
  import { minecraftAccount as minecraftAccountSchema } from "$lib/shared/db/schema";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import * as HoverCard from "$ui/hover-card";
  import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
  import type { InferSelectModel } from "drizzle-orm";

  const { minecraftAccount }: { minecraftAccount?: InferSelectModel<typeof minecraftAccountSchema> | null } = $props();
</script>

{#if minecraftAccount}
  <div class="flex items-center gap-1">
    <HoverCard.Root>
      <HoverCard.Trigger href={resolve("/(protected)/dashboard/(admin)/admin/users/[userID]", { userID: minecraftAccount.userId })} class="flex items-center gap-1 px-1">
        {#snippet child({ props })}
          <Button {...props} variant="ghost">
            <Avatar.Root class="size-6 rounded-none">
              <Avatar.Image src="https://nmsr.nickac.dev/face/{minecraftAccount.uuid}" alt={minecraftAccount.username} class="rounded-none" />
              <Avatar.Fallback>
                {minecraftAccount.username.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
            {minecraftAccount.username}
          </Button>
        {/snippet}
      </HoverCard.Trigger>
      <HoverCard.Content class="w-85">
        <div class="flex justify-start gap-4">
          <Avatar.Root class="rounded-none">
            <Avatar.Image src="https://nmsr.nickac.dev/face/{minecraftAccount.uuid}" alt={minecraftAccount.username} class="rounded-none" />
            <Avatar.Fallback>
              {minecraftAccount.username.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          <div class="space-y-1">
            <h4 class="text-sm font-semibold">{minecraftAccount.username}</h4>
            <p class="text-sm break-all text-muted-foreground">
              {minecraftAccount.uuid}
            </p>
            <div class="flex items-center pt-2">
              <CalendarDaysIcon class="me-2 size-4 opacity-70" />
              <span class="text-xs text-muted-foreground">
                Joined <DateTooltip date={new Date(minecraftAccount.createdAt)} class="text-xs" />
              </span>
            </div>
          </div>
        </div>
      </HoverCard.Content>
    </HoverCard.Root>
  </div>
{:else}
  <span class="text-sm text-muted-foreground">No linked Minecraft account</span>
{/if}
