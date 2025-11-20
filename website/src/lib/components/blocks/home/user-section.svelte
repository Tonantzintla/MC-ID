<script lang="ts">
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
  import { type Icon as IconType } from "@lucide/svelte";
  import Fingerprint from "@lucide/svelte/icons/fingerprint";
  import Globe from "@lucide/svelte/icons/globe";
  import ShieldCheck from "@lucide/svelte/icons/shield-check";
</script>

<section id="users" class="py-16 md:py-24">
  <div class="@container mx-auto max-w-6xl px-6">
    <div class="mb-16 text-center">
      <div class="mb-4 inline-flex items-center rounded-full border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">For Users</div>
      <h2 class="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">One Identity, Everywhere</h2>
      <p class="mx-auto max-w-2xl text-lg text-muted-foreground">Setup MC-ID once and forget about it! Login without having to open Minecraft to verify yourself across apps.</p>
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      {@render featureCard({
        title: "Universal Sign-In",
        icon: Globe,
        description: "Use your MC-ID to log in to any supported application. Without having to open Minecraft."
      })}

      {@render featureCard({
        title: "Privacy First",
        icon: Fingerprint,
        description: "You control your data. Apps only see what you explicitly allow them to see."
      })}

      {@render featureCard({
        title: "Secure by Design",
        icon: ShieldCheck,
        description: "Built with industry-standard security protocols to keep your account safe from unauthorized access."
      })}
    </div>
  </div>
</section>

{#snippet featureCard({ title, icon: IconComponent, description }: { title: string; icon: typeof IconType; description: string })}
  <div class="group relative">
    <div class="absolute -inset-px rounded-xl bg-linear-to-b from-border to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
    <Card class="relative h-full border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader class="pb-2">
        <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 ring-inset">
          <IconComponent class="h-6 w-6" />
        </div>
        <h3 class="text-xl font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p class="leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  </div>
{/snippet}
