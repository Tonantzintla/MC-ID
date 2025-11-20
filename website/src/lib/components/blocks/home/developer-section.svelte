<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Code from "@lucide/svelte/icons/code";
  import Lock from "@lucide/svelte/icons/lock";
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

      <div class="relative">
        <div class="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-50 blur-2xl"></div>
        <div class="relative overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div class="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
            <div class="flex gap-1.5">
              <div class="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div class="h-3 w-3 rounded-full bg-green-500/80"></div>
            </div>
            <div class="ml-2 font-mono text-xs text-muted-foreground">auth.ts</div>
          </div>
          <div class="overflow-x-auto p-6">
            <pre class="font-mono text-sm leading-relaxed">
<span class="text-pink-500">import</span> <span class="text-foreground">{`{`}</span> betterAuth <span class="text-foreground">{`}`}</span> <span class="text-pink-500">from</span> <span class="text-green-400">"better-auth"</span>;
<span class="text-pink-500">import</span> <span class="text-foreground">{`{`}</span> oidc <span class="text-foreground">{`}`}</span> <span class="text-pink-500">from</span> <span class="text-green-400">"better-auth/plugins"</span>;

<span class="text-blue-400">export const</span> auth = <span class="text-blue-300">betterAuth</span>(<span class="text-foreground">{`{`}</span>
    plugins: [
        <span class="text-blue-300">oidc</span>(<span class="text-foreground">{`{`}</span>
            loginPage: <span class="text-green-400">"/sign-in"</span>,
            providers: [
                <span class="text-foreground">{`{`}</span>
                    id: <span class="text-green-400">"mc-id"</span>,
                    clientId: <span class="text-green-400">"..."</span>,
                    clientSecret: <span class="text-green-400">"..."</span>,
                    issuer: <span class="text-green-400">"https://mc-id.com"</span>,
                <span class="text-foreground">{`}`}</span>
            ]
        <span class="text-foreground">{`}`}</span>)
    ]
<span class="text-foreground">{`}`}</span>);
</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
