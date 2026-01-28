<script lang="ts">
  import { cn } from "$lib/utils";
  import { Button, type ButtonProps } from "$ui/button";
  import * as Tooltip from "$ui/tooltip";
  import { tz } from "@date-fns/tz";
  import { format, formatDistanceToNowStrict } from "date-fns";

  type Props = ButtonProps & {
    date: Date;
  };
  const { date, class: className, variant = "ghost", ...restProps }: Props = $props();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <Button class={cn("h-auto p-1", className)} {variant} {...restProps} {...props}>
        {formatDistanceToNowStrict(date, { addSuffix: true, in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}
      </Button>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content>
    <p>
      {format(date, "Pp", { in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone) })}
    </p>
  </Tooltip.Content>
</Tooltip.Root>
