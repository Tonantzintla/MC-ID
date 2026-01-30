import { DateTooltip } from "$components/data-table";
import MinecraftUser from "$components/data-table/minecraft-user.svelte";
import DataTableSortingButton from "$components/data-table/sorting-button.svelte";
import { Checkbox } from "$ui/checkbox";
import { renderComponent } from "$ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDuration, intervalToDuration, toDate } from "date-fns";
import type { ApiKeyType } from "./+page.server";
import DataTableActions from "./data-table-actions.svelte";

export const columns: ColumnDef<ApiKeyType>[] = [
  {
    id: "select",
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all"
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        "aria-label": "Select row"
      }),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: "ID",
    accessorKey: "id",
    header: "ID",
    enableSorting: true
  },
  {
    id: "Name",
    accessorKey: "name",
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Name",
        column
      });
    },
    enableHiding: false
  },
  {
    id: "Owner",
    accessorKey: "minecraftAccount",
    enableHiding: false,
    filterFn: (row, columnId, filterValue) => {
      const mcAccount = row.getValue<ApiKeyType["minecraftAccount"]>(columnId);
      if (!mcAccount) return false;
      const search = filterValue.toLowerCase();
      return mcAccount.username.toLowerCase().includes(search) || mcAccount.uuid.toLowerCase().includes(search);
    },
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Owner",
        column
      });
    },
    cell: ({ getValue }) => {
      return renderComponent(MinecraftUser, { minecraftAccount: getValue() as ApiKeyType["minecraftAccount"] });
    }
  },
  {
    id: "Request Count",
    accessorKey: "requestCount",
    enableColumnFilter: false,
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Request Count",
        column,
        datatype: "number"
      });
    }
  },
  {
    id: "Rate Limit Enabled",
    accessorKey: "rateLimitEnabled",
    header: "Rate Limit Enabled",
    enableColumnFilter: false,
    filterFn: "includesString",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No")
  },
  {
    id: "Rate Limit Time Window",
    accessorKey: "rateLimitTimeWindow",
    enableColumnFilter: false,
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Rate Limit Time Window",
        column,
        datatype: "number"
      });
    },
    cell: ({ getValue }) => {
      const ms = getValue() as number;
      return formatDuration(intervalToDuration({ start: 0, end: ms }));
    }
  },
  {
    id: "Rate Limit Max",
    accessorKey: "rateLimitMax",
    enableColumnFilter: false,
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Rate Limit Max",
        column,
        datatype: "number"
      });
    }
  },
  {
    id: "Created",
    accessorKey: "createdAt",
    enableColumnFilter: false,
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Created",
        column,
        datatype: "date"
      });
    },
    cell: ({ getValue }) => {
      const date = toDate(getValue() as string);
      return renderComponent(DateTooltip, { date });
    }
  },
  {
    id: "Enabled",
    accessorKey: "enabled",
    header: "Enabled",
    enableColumnFilter: false,
    filterFn: "includesString",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No")
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id });
    }
  }
];
