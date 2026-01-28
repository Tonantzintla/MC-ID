<script lang="ts" module>
  export const boolean = [
    { label: "Yes", value: true },
    { label: "No", value: false }
  ];
</script>

<script lang="ts" generics="TData, TValue">
  import { cn } from "$lib/utils.js";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Command from "$ui/command";
  import * as Popover from "$ui/popover";
  import { Separator } from "$ui/separator";
  import CheckIcon from "@lucide/svelte/icons/check";
  import CirclePlusIcon from "@lucide/svelte/icons/circle-plus";
  import type { Column } from "@tanstack/table-core";
  import type { Component } from "svelte";
  import { SvelteSet } from "svelte/reactivity";

  const {
    column,
    title,
    options
  }: {
    column: Column<TData, TValue>;
    title: string;
    options: {
      label: string;
      value: unknown;
      icon?: Component;
    }[];
  } = $props();

  const facets = $derived(column?.getFacetedUniqueValues());
  const selectedValues = $derived(new SvelteSet(column?.getFilterValue() as unknown[]));
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" size="sm" class="border-dashed">
        <CirclePlusIcon />
        {title}
        {#if selectedValues.size > 0}
          <Separator orientation="vertical" class="mx-2 h-4" />
          <Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
            {selectedValues.size}
          </Badge>
          <div class="hidden space-x-1 lg:flex">
            {#if selectedValues.size > 2}
              <Badge variant="secondary" class="rounded-sm px-1 font-normal">
                {selectedValues.size} selected
              </Badge>
            {:else}
              {#each options.filter((opt) => selectedValues.has(opt.value)) as option (option)}
                <Badge variant="secondary" class="rounded-sm px-1 font-normal">
                  {option.label}
                </Badge>
              {/each}
            {/if}
          </div>
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-50 p-0" align="start">
    <Command.Root>
      <Command.Input placeholder={title} />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group>
          {#each options as option (option)}
            {@const isSelected = selectedValues.has(option.value)}
            <Command.Item
              onSelect={() => {
                if (isSelected) {
                  selectedValues.delete(option.value);
                } else {
                  selectedValues.add(option.value);
                }
                const filterValues = Array.from(selectedValues);
                column?.setFilterValue(filterValues.length ? filterValues : undefined);
              }}>
              <div class={cn("me-2 flex size-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                <CheckIcon class="size-4" />
              </div>
              {#if option.icon}
                {@const Icon = option.icon}
                <Icon class="text-muted-foreground" />
              {/if}

              <span>{option.label}</span>
              {#if facets?.get(option.value)}
                <span class="ms-auto flex size-4 items-center justify-center font-mono text-xs">
                  {facets.get(option.value)}
                </span>
              {/if}
            </Command.Item>
          {/each}
        </Command.Group>
        {#if selectedValues.size > 0}
          <Command.Separator />
          <Command.Group>
            <Command.Item onSelect={() => column?.setFilterValue(undefined)} class="justify-center text-center">Clear filters</Command.Item>
          </Command.Group>
        {/if}
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
