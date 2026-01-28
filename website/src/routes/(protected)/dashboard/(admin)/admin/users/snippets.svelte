<script lang="ts" module>
  export { rolesSnippet };
</script>

<script lang="ts">
  import type { UserRole } from "$lib/roles";
  import { Badge } from "$ui/badge";
</script>

{#snippet rolesSnippet({ roles }: { roles: UserRole[] })}
  {#each roles as role, index (index)}
    <Badge variant="outline" class="mr-1 capitalize">{role}</Badge>
  {/each}
{/snippet}
