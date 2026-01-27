<script lang="ts" generics="TData, TValue">
  import { FlexRender } from "$ui/data-table";
  import * as Table from "$ui/table";
  import { type ColumnDef, type Table as TableType } from "@tanstack/table-core";

  type DataTableProps<TData, TValue> = {
    table: TableType<TData>;
    columns: ColumnDef<TData, TValue>[];
  };

  const { table, columns }: DataTableProps<TData, TValue> = $props();
</script>

<Table.Root>
  <Table.Header>
    {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
      <Table.Row>
        {#each headerGroup.headers as header (header.id)}
          <Table.Head colspan={header.colSpan}>
            {#if !header.isPlaceholder}
              <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
            {/if}
          </Table.Head>
        {/each}
      </Table.Row>
    {/each}
  </Table.Header>
  <Table.Body>
    {#each table.getRowModel().rows as row (row.id)}
      <Table.Row data-state={row.getIsSelected() && "selected"}>
        {#each row.getVisibleCells() as cell (cell.id)}
          <Table.Cell>
            <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
          </Table.Cell>
        {/each}
      </Table.Row>
    {:else}
      <Table.Row>
        <Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
