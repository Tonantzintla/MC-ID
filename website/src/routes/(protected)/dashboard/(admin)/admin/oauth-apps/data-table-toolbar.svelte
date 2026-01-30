<script lang="ts" generics="TData">
  import { DataTableFacetedFilter, DataTableViewOptions, booleanOptions } from "$components/data-table";
  import { Button } from "$ui/button";
  import { Input } from "$ui/input";
  import * as Select from "$ui/select";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Table } from "@tanstack/table-core";

  const { table }: { table: Table<TData> } = $props();

  let filterColumn: string = $state("Name");
  const isFiltered = $derived(table.getState().columnFilters.length > 0);
  const disabledCol = $derived(table.getColumn("Disabled"));
</script>

<div class="flex items-center justify-between gap-2">
  <div class="flex flex-1 items-center space-x-2">
    <Input
      placeholder="Filter by {filterColumn.toLowerCase()}"
      value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
      oninput={(e) => {
        table.getColumn(filterColumn)?.setFilterValue(e.currentTarget.value);
      }}
      onchange={(e) => {
        table.getColumn(filterColumn)?.setFilterValue(e.currentTarget.value);
      }}
      class="w-37.5 lg:w-62.5" />

    <Select.Root type="single" bind:value={filterColumn}>
      <Select.Trigger class="w-45">
        <span class="capitalize">{filterColumn}</span>
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Filter Column</Select.Label>
          <Select.Separator />
          {#each table.getAllColumns().filter((col) => typeof col.accessorFn !== "undefined" && col.getCanFilter()) as column (column.id)}
            <Select.Item value={column.id} class="capitalize">
              {column.id}
            </Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>

    {#if disabledCol}
      <DataTableFacetedFilter column={disabledCol} title="Disabled" options={booleanOptions} />
    {/if}

    {#if isFiltered}
      <Button variant="ghost" onclick={() => table.resetColumnFilters()} class="h-8 px-2 lg:px-3">
        Reset
        <XIcon />
      </Button>
    {/if}
  </div>
  <DataTableViewOptions {table} />
</div>
