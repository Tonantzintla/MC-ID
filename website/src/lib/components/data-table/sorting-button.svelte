<script lang="ts">
  import { cn } from "$lib/utils";
  import { Button } from "$ui/button";
  import * as DropdownMenu from "$ui/dropdown-menu";
  import { EyeOffIcon, type Icon as IconType } from "@lucide/svelte";
  import ArrowDown01 from "@lucide/svelte/icons/arrow-down-0-1";
  import ArrowDown10 from "@lucide/svelte/icons/arrow-down-1-0";
  import ArrowDownAZ from "@lucide/svelte/icons/arrow-down-a-z";
  import ArrowDownZA from "@lucide/svelte/icons/arrow-down-z-a";
  import CalendarArrowDown from "@lucide/svelte/icons/calendar-arrow-down";
  import CalendarArrowUp from "@lucide/svelte/icons/calendar-arrow-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import { type Column } from "@tanstack/table-core";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    column: Column<any, any>;
    title: string;
    datatype?: "string" | "number" | "date";
  } & HTMLAttributes<HTMLDivElement>;

  const { column, title, class: className, datatype = "string", ...restProps }: Props = $props();

  // Get the right icon based on datatype so the template is cleaner
  const SortIcon = $derived.by<Record<"asc" | "desc", typeof IconType>>(() => {
    return {
      asc: datatype === "string" ? ArrowDownAZ : datatype === "number" ? ArrowDown01 : CalendarArrowUp,
      desc: datatype === "string" ? ArrowDownZA : datatype === "number" ? ArrowDown10 : CalendarArrowDown
    };
  });
</script>

{#if !column?.getCanSort()}
  <div class={className} {...restProps}>
    {title}
  </div>
{:else}
  <div class={cn("flex items-center", className)} {...restProps}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="sm" class="-ms-3 h-8 data-[state=open]:bg-accent">
            <span>
              {title}
            </span>
            {#if column.getIsSorted() === "desc"}
              <SortIcon.desc />
            {:else if column.getIsSorted() === "asc"}
              <SortIcon.asc />
            {:else}
              <ChevronsUpDown />
            {/if}
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item onclick={() => column.toggleSorting(false)}>
          <SortIcon.asc class="me-2 size-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={() => column.toggleSorting(true)}>
          <SortIcon.desc class="me-2 size-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenu.Item>
        {#if column.getCanHide()}
          <DropdownMenu.Separator />
          <DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
            <EyeOffIcon class="me-2 size-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenu.Item>
        {/if}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
{/if}
