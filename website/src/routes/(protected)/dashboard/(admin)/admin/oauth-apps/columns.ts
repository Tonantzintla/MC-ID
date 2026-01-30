import { DateTooltip } from "$components/data-table";
import MinecraftUser from "$components/data-table/minecraft-user.svelte";
import DataTableSortingButton from "$components/data-table/sorting-button.svelte";
import { Checkbox } from "$ui/checkbox";
import { renderComponent } from "$ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { toDate } from "date-fns";
import type { OauthClientType } from "./+page.server";
import DataTableActions from "./data-table-actions.svelte";

export const columns: ColumnDef<OauthClientType>[] = [
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
      const mcAccount = row.getValue<OauthClientType["minecraftAccount"]>(columnId);
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
      return renderComponent(MinecraftUser, { minecraftAccount: getValue() as OauthClientType["minecraftAccount"] });
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
    id: "Disabled",
    accessorKey: "disabled",
    header: "Disabled",
    enableColumnFilter: false,
    filterFn: "includesString",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No")
  },
  {
    id: "Reports",
    accessorKey: "oauthClientReports",
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Reports",
        column
      });
    },
    enableColumnFilter: false,
    cell: ({ getValue }) => {
      const reports = getValue() as OauthClientType["oauthClientReports"];
      // Return the number of reports and status of each, e.g., "5 (1 open, 2 closed, 3 pending)"
      // Possible statuses: "pending", "under_review", "resolved", "dismissed"
      const total = reports.length;
      const statusCounts: Record<string, number> = {};
      for (const report of reports) {
        statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
      }
      const statusParts = Object.entries(statusCounts).map(([status, count]) => `${count} ${status.replace("_", " ")}`);
      return `${total} (${statusParts.join(", ")})`;
    }
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
