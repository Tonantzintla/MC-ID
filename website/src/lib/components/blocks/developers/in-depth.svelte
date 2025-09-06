<script lang="ts">
</script>

{@render inDepthSection({
  title: "Everything. Everywhere.",
  description: ["MC-ID is designed to be integrated into anything, whether it's a website, a mobile app, or even a desktop application. If you can make HTTP requests, you can use MC-ID."]
})}

{@render inDepthSection({
  title: "Customizable to your needs",
  description: ["MC-ID can be used in 2 ways: headless or with MC-ID's own UI. The headless option allows you to fully customize the look and feel of the authentication flow, while the UI option provides a quick and easy way to get started."]
})}

{@render inDepthSection({
  title: "Open-Source and Flexible",
  description: ["Rather manage your own infrastructure? No problem! MC-ID is fully open-source, allowing you to self-host and maintain complete control over your authentication system."]
})}

{#snippet inDepthSection({ title, description }: { title: string; description: string[] })}
  <section class="group/in-depth py-16 md:py-32">
    <div class="mx-auto max-w-5xl px-6">
      <div class="grid gap-6 md:grid-cols-2 md:gap-12">
        <h2 class="text-4xl font-medium">{title}</h2>
        <div class="space-y-6">
          {#each description as paragraph, index (index)}
            <p>{paragraph}</p>
          {/each}
        </div>
      </div>
    </div>
  </section>
{/snippet}
