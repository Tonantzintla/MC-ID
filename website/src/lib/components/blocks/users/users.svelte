<script lang="ts">
  import Cards from "$components/blocks/users/cards.svelte";
  import InDepth from "$components/blocks/users/in-depth.svelte";
  import { Button } from "$lib/components/ui/button";
</script>

<Cards />
<InDepth />

<section class="py-16">
  <div class="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
    <div class="text-center">
      <h2 class="text-4xl font-semibold text-balance lg:text-5xl">Ready to get started?</h2>
      <p class="mt-4">Creating an account ensures that you don't have to use Minecraft again to log into an app</p>
      <div class="mt-12 flex flex-wrap justify-center gap-4">
        <Button href="/dashboard" size="lg">Get Started</Button>
        <Button href="/dashboard" size="lg" variant="outline">Login</Button>
      </div>
    </div>
  </div>
</section>
