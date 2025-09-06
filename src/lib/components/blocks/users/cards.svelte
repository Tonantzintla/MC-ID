<script lang="ts">
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
  import { type Icon as IconType } from "@lucide/svelte";
  import Fingerprint from "@lucide/svelte/icons/fingerprint";
  import HatGlasses from "@lucide/svelte/icons/hat-glasses";
  import UserCog from "@lucide/svelte/icons/user-cog";
  import CardDecorator from "./card-decorator.svelte";
</script>

<section class="py-16 md:py-32">
  <div class="@container mx-auto max-w-5xl px-6">
    <div class="text-center">
      <h2 class="text-4xl font-semibold text-balance lg:text-5xl">Built with privacy and security in mind</h2>
      <p class="mt-4">MC-ID is designed to prioritize your privacy and security, ensuring that your account and data is protected while you enjoy a seamless user experience.</p>
    </div>
    <Card class="mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-card/5 *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0">
      {@render featureCard({
        title: "Private",
        icon: HatGlasses,
        description: "Apps can only access your public data, which is your Minecraft username, UUID, and skin."
      })}

      {@render featureCard({
        title: "Secure",
        icon: Fingerprint,
        description: "MC-ID and the apps you use with it do not have access to your Microsoft or Minecraft account."
      })}

      {@render featureCard({
        title: "Control",
        icon: UserCog,
        description: "You are in control of your data, account, and the apps you use with MC-ID."
      })}
    </Card>
  </div>
</section>

{#snippet featureCard({ title, icon: IconComponent, description }: { title: string; icon: typeof IconType; description: string })}
  <div class="group shadow-card/5">
    <CardHeader class="pb-3">
      <CardDecorator>
        <IconComponent class="size-6" aria-hidden />
      </CardDecorator>

      <h3 class="mt-6 font-medium">{title}</h3>
    </CardHeader>

    <CardContent>
      <p class="text-sm">{description}</p>
    </CardContent>
  </div>
{/snippet}
