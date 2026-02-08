<script lang="ts">
  import { type Service, servicesUsingMCID } from "$lib/constants/used-by";
  import * as Avatar from "$ui/avatar";
  import { Button } from "$ui/button";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Code from "@lucide/svelte/icons/code";
  import Lock from "@lucide/svelte/icons/lock";
  import { codeToHtml } from "shiki/bundle/web";

  const code = `import { betterAuth } from "better-auth";
import { oidc } from "better-auth/plugins";

export const auth = betterAuth({
    // ...
    plugins: [
        oidc({
            loginPage: "/sign-in",
            providers: [
                {
                    id: "mc-id",
                    clientId: "...",
                    clientSecret: "...",
                    issuer: "https://mc-id.com",
                }
            ]
        })
    ],
    // ...
});`;

  const html = await codeToHtml(code, {
    lang: "typescript",
    themes: { dark: "github-dark", light: "github-light" },
    rootStyle: "background-color: transparent;"
  });
</script>

<section id="developers" class="overflow-hidden bg-muted/30 py-16 md:py-24">
  <div class="mx-auto max-w-6xl px-6">
    <div class="grid items-center gap-16 lg:grid-cols-2">
      <div>
        <div class="mb-4 inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">For Developers</div>
        <h2 class="mb-6 text-3xl font-bold tracking-tight lg:text-4xl">
          Standard OIDC & <br /> Powerful API
        </h2>
        <p class="mb-8 text-lg text-muted-foreground">Integrate MC-ID into your application using standard OpenID Connect protocols. Compatible with any OIDC client library in any language.</p>

        <div class="mb-8 space-y-6">
          <div class="flex gap-4">
            <div class="flex-none">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock class="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 class="mb-1 font-semibold">OIDC Provider</h3>
              <p class="text-sm text-muted-foreground">Full OpenID Connect compliance. Use existing libraries like NextAuth, Auth.js, or Passport.js.</p>
            </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-none">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Code class="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 class="mb-1 font-semibold">Headless API</h3>
              <p class="text-sm text-muted-foreground">Need more control? Use our comprehensive REST API for custom integrations and headless flows.</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <Button href="https://docs.mc-id.com" size="lg" class="gap-2">
            Read the Docs <ArrowRight class="h-4 w-4" />
          </Button>
          <Button href="https://mc-id.com/api" variant="outline" size="lg">API Reference</Button>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-xl border bg-card shadow-lg">
        <div class="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
          <div class="flex gap-1.5">
            <div class="h-3 w-3 rounded-full bg-red-500/80"></div>
            <div class="h-3 w-3 rounded-full bg-yellow-500/80"></div>
            <div class="h-3 w-3 rounded-full bg-green-500/80"></div>
          </div>
          <div class="ml-2 font-mono text-xs text-muted-foreground">auth.ts</div>
        </div>
        <div class="overflow-x-auto p-2">
          {@html html}
        </div>
      </div>
    </div>
  </div>
</section>
<section class="bg-background py-16">
  <div class="mx-auto max-w-5xl px-6">
    <h2 class="text-center text-3xl font-bold tracking-tight lg:text-4xl">MC-ID is already being used by</h2>
    <div class="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-8 sm:gap-x-12 sm:gap-y-12">
      {#each servicesUsingMCID as service, index (index)}
        {@render usedBy(service)}
      {/each}
    </div>
  </div>
</section>

{#snippet usedBy({ src, name, link, showName = false }: Service)}
  <a href={link} target="_blank" class="flex h-20 w-fit items-center justify-center gap-4 rounded-md border p-4 transition-opacity hover:opacity-80">
    <Avatar.Root class="size-auto rounded-none">
      <Avatar.Image class="max-h-14" {src} alt="{name} logo" />
      <Avatar.Fallback>{name.slice(0, 2)}</Avatar.Fallback>
    </Avatar.Root>
    {#if showName}
      <span class="text-xl font-medium tracking-tight">
        {name}
      </span>
    {/if}
  </a>
{/snippet}
