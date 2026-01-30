<script lang="ts">
  import type { PageProps } from "./$types";
  import { columns } from "./columns";
  import DataTable from "./data-table.svelte";

  const { data }: PageProps = $props();
</script>

<DataTable data={data.oauthClients} {columns} />
