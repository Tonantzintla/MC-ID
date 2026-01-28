import { DateTooltip } from "$components/data-table";
import DataTableSortingButton from "$components/data-table/sorting-button.svelte";
import type { UserRole } from "$lib/roles";
import { Checkbox } from "$ui/checkbox";
import { renderComponent, renderSnippet } from "$ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import type { UserWithRole } from "better-auth/plugins";
import { toDate } from "date-fns";
import DataTableActions from "./data-table-actions.svelte";
import { rolesSnippet } from "./snippets.svelte";

export const columns: ColumnDef<UserWithRole>[] = [
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
    enableSorting: false,
    enableHiding: true
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
    id: "Email",
    accessorKey: "email",
    header: ({ column }) => {
      return renderComponent(DataTableSortingButton, {
        title: "Email",
        column
      });
    }
  },
  {
    id: "Email Verified",
    accessorKey: "emailVerified",
    header: "Email Verified",
    enableColumnFilter: false,
    filterFn: "includesString",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No")
  },
  {
    id: "Banned",
    accessorKey: "banned",
    header: "Banned",
    enableColumnFilter: false,
    filterFn: "includesString",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No")
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
    id: "Roles",
    header: "Roles",
    enableColumnFilter: false,
    filterFn: "arrIncludesAll",
    accessorFn: (row) => {
      const roleData = row.role as string;
      return roleData ? roleData.split(",").map((r) => r.trim().toLowerCase()) : [];
    },
    cell: ({ getValue }) => {
      const roles = getValue() as UserRole[];
      return renderSnippet(rolesSnippet, { roles });
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.id });
    },
    enableSorting: false,
    enableHiding: false
  }
];
