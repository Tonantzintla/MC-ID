<script lang="ts">
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
  import { type Icon as IconType } from "@lucide/svelte";
  import CodeXml from "@lucide/svelte/icons/code-xml";
  import Globe from "@lucide/svelte/icons/globe";
  import Palette from "@lucide/svelte/icons/palette";
  import CardDecorator from "./card-decorator.svelte";
</script>

<section class="py-16 md:py-32">
  <div class="@container mx-auto max-w-5xl px-6">
    <div class="text-center">
      <h2 class="text-4xl font-semibold text-balance lg:text-5xl">Built with developers in mind</h2>
      <p class="mt-4">MC-ID is designed to prioritize your developer experience, ensuring it covers all your needs while being simple and easy to integrate.</p>
    </div>
    <div class="mx-auto mt-8 grid max-w-sm gap-4 md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3">
      {@render featureCard({
        title: "Anywhere",
        icon: Globe,
        description: "You can integrate MC-ID into anything, if you can make HTTP requests, you can use MC-ID."
      })}

      {@render featureCard({
        title: "Customizable",
        icon: Palette,
        description: "MC-ID is built to be customizable, so you can make it fit your app's design and needs."
      })}

      {@render featureCard({
        title: "Open-Source",
        icon: CodeXml,
        description: "MC-ID is open-source, so if you prefer to self-host, you can do that too!"
      })}
    </div>
  </div>
</section>

{#snippet featureCard({ title, icon: IconComponent, description }: { title: string; icon: typeof IconType; description: string })}
  <Card class="group relative mx-auto overflow-hidden rounded-none border shadow-card/5 *:text-center">
    <span class="absolute -top-px -left-px block size-2 border-white" style="border-top-width: 2px; border-left-width: 2px;"></span>
    <span class="absolute -top-px -right-px block size-2 border-white" style="border-top-width: 2px; border-right-width: 2px;"></span>
    <span class="absolute -bottom-px -left-px block size-2 border-white" style="border-bottom-width: 2px; border-left-width: 2px;"></span>
    <span class="absolute -right-px -bottom-px block size-2 border-white" style="border-bottom-width: 2px; border-right-width: 2px;"></span>

    <CardHeader>
      <CardDecorator>
        <IconComponent class="size-6" aria-hidden />
      </CardDecorator>

      <h3 class="mt-6 font-medium">{title}</h3>
    </CardHeader>

    <CardContent>
      <p class="text-sm">{description}</p>
    </CardContent>
  </Card>
{/snippet}
