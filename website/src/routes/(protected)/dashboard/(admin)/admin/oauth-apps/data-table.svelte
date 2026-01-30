<script lang="ts" generics="TData, TValue">
  import Pagination from "$components/data-table/pagination.svelte";
  import Table from "$components/data-table/table.svelte";
  import { createSvelteTable } from "$ui/data-table";
  import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, type ColumnDef, type ColumnFiltersState, type PaginationState, type RowSelectionState, type SortingState, type VisibilityState } from "@tanstack/table-core";
  import DataTableToolbar from "./data-table-toolbar.svelte";

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  };

  const { data, columns }: DataTableProps<TData, TValue> = $props();
  let rowSelection = $state<RowSelectionState>({});
  let columnVisibility = $state<VisibilityState>({});
  let columnFilters = $state<ColumnFiltersState>([]);
  let sorting = $state<SortingState>([]);
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const table = createSvelteTable({
    get data() {
      return data;
    },
    state: {
      get sorting() {
        return sorting;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
      get columnFilters() {
        return columnFilters;
      },
      get pagination() {
        return pagination;
      }
    },
    columns: (() => columns)(),
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        rowSelection = updater(rowSelection);
      } else {
        rowSelection = updater;
      }
    },
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === "function") {
        columnVisibility = updater(columnVisibility);
      } else {
        columnVisibility = updater;
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        pagination = updater(pagination);
      } else {
        pagination = updater;
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  $effect(() => {
    table.setColumnVisibility({
      ID: false,
      Disabled: false
    });
  });
</script>

<div class="space-y-4">
  <DataTableToolbar {table} />
  <div class="rounded-md border">
    <Table {table} {columns} />
  </div>
  <Pagination {table} />
</div>
