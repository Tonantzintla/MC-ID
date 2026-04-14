<script lang="ts" module>
  import { type VariantProps, tv } from "tailwind-variants";

  export const toggleVariants = tv({
    base: "focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 group/toggle inline-flex items-center justify-center gap-1 rounded-4xl border border-transparent bg-input/50 text-sm font-medium whitespace-nowrap text-muted-foreground transition-[color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 hover:bg-input/80 hover:text-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    variants: {
      variant: {
        default: "",
        outline: "border-border bg-background text-foreground hover:bg-muted dark:bg-transparent dark:hover:bg-input/30 data-[state=on]:bg-muted"
      },
      size: {
        default: "h-9 min-w-9 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        sm: "h-8 min-w-8 rounded-[min(var(--radius-lg),1rem)] px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 min-w-10 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  });

  export type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
  export type ToggleSize = VariantProps<typeof toggleVariants>["size"];
  export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
  import { Toggle as TogglePrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    pressed = $bindable(false),
    class: className,
    size = "default",
    variant = "default",
    ...restProps
  }: TogglePrimitive.RootProps & {
    variant?: ToggleVariant;
    size?: ToggleSize;
  } = $props();
</script>

<TogglePrimitive.Root bind:ref bind:pressed data-slot="toggle" class={cn(toggleVariants({ variant, size }), className)} {...restProps} />
