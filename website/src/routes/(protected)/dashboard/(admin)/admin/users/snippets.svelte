<script lang="ts" module>
  export { dateTooltip, rolesSnippet };
</script>

<script lang="ts">
  import type { UserRole } from "$lib/roles";
  import { Badge } from "$ui/badge";
  import { Button } from "$ui/button";
  import * as Tooltip from "$ui/tooltip";
  import { tz } from "@date-fns/tz";
  import { format, formatDistanceToNowStrict } from "date-fns";
</script>

{#snippet dateTooltip({ date }: { date: Date })}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        <Button variant="ghost" class="h-auto p-1" {...props}>{formatDistanceToNowStrict(date, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}</Button>
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>
        {format(date, "Pp", { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}
      </p>
    </Tooltip.Content>
  </Tooltip.Root>
{/snippet}

{#snippet rolesSnippet({ roles }: { roles: UserRole[] })}
  {#each roles as role, index (index)}
    <Badge variant="outline" class="mr-1 capitalize">{role}</Badge>
  {/each}
{/snippet}
