<script lang="ts">
</script>

{@render inDepthSection({
  title: "Private by design.",
  description: ["MC-ID is built to protect your privacy. The apps that you use with MC-ID will only access your public data, which is your Minecraft username, UUID, and skin.", "They are not able to access your private data, such as your MC-ID email. Nor do they have access to your Microsoft account data, as we simply don't have nor can we get it."]
})}

{@render inDepthSection({
  title: "Security at its core.",
  description: ["MC-ID exists because there is no secure way to authenticate with Minecraft accounts.", "Your only option is to login with your Microsoft account, and for some reason, Microsoft thought it was a good idea to give the app tokens that allow them to login in with your Minecraft account. This is how most people get hacked."]
})}

{@render inDepthSection({
  title: "You. Are. In. Control.",
  description: ["Do you wish that an app no longer has access to your data?", "Simply revoke the app's access to your data in the dashboard, and you're done!"]
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
