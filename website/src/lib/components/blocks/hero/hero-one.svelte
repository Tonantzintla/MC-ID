<script lang="ts">
  import { browser } from "$app/environment";
  import LightRays from "$components/reactbits/LightRays.svelte";
  import { Button } from "$ui/button";
  import { Debounced, IsInViewport } from "runed";
  import * as skinview3d from "skinview3d";
  import { untrack } from "svelte";
  import { innerWidth } from "svelte/reactivity/window";

  const skinHashes = ["46acd06e8483b176e8ea39fc12fe105eb3a2a4970f5100057e9d84d4b60bdfa7", "6ac6ca262d67bcfb3dbc924ba8215a18195497c780058a5749de674217721892", "fece7017b1bb13926d1158864b283b8b930271f80a90482f174cca6a17e88236", "226c617fde5b1ba569aa08bd2cb6fd84c93337532a872b3eb7bf66bdd5b395f8", "7cb3ba52ddd5cc82c0b050c3f920f87da36add80165846f479079663805433db", "6c160fbd16adbc4bff2409e70180d911002aebcfa811eb6ec3d1040761aea6dd", "d5c4ee5ce20aed9e33e866c66caa37178606234b3721084bf01d13320fb2eb3f", "b66bc80f002b10371e2fa23de6f230dd5e2f3affc2e15786f65bc9be4c6eb71a", "eee522611005acf256dbd152e992c60c0bb7978cb0f3127807700e478ad97664"] as const;

  let skinHash: string = skinHashes[Math.floor(Math.random() * skinHashes.length)];

  let viewer: skinview3d.SkinViewer;
  let minecraftAvatarContainer = $state<HTMLDivElement>(null!);
  let minecraftAvatar = $state<HTMLCanvasElement>(null!);
  let canvasIsLoading = $state<boolean>(true);

  const siteWidth = new Debounced(() => innerWidth.current, 25);

  const inViewport = new IsInViewport(() => minecraftAvatarContainer, {
    rootMargin: "200px",
    threshold: 0
  });

  $effect.pre(() => {
    if (!browser || !minecraftAvatarContainer || !minecraftAvatar || !siteWidth.current || !inViewport.current) return;
    const minecraftAvatarContainerDimensions = minecraftAvatarContainer.getBoundingClientRect();
    untrack(() => {
      viewer = new skinview3d.SkinViewer({
        canvas: minecraftAvatar,
        width: minecraftAvatarContainerDimensions.width,
        height: minecraftAvatarContainerDimensions.height,
        skin: `https://nmsr.nickac.dev/skin/${skinHash}`,
        enableControls: true,
        animation: new skinview3d.IdleAnimation(),
        zoom: 0.7,
        background: "#050505",
        panorama: "/assets/images/panorama.png"
      });
      // disable zooming
      viewer.controls.enableZoom = false;
      // enable damping (smooth dragging)
      viewer.controls.enableDamping = true;
      // disable rotation on the y axis
      viewer.controls.maxPolarAngle = -Math.PI / 2; // upper boundary for the polar angle
      viewer.controls.minPolarAngle = Math.PI / 2; // lower boundary for the polar angle
      canvasIsLoading = false;
    });

    return () => {
      canvasIsLoading = true;
      viewer.dispose();
    };
  });

  $effect(() => {
    if (!inViewport.current) {
      canvasIsLoading = true;
      viewer?.dispose();
    }
  });
</script>

<div class="relative isolate">
  <div class="absolute inset-0 -z-10 size-full">
    <LightRays raysColor="#00BC7D" raysSpeed={1} lightSpread={0.5} rayLength={3} followMouse={false} noiseAmount={0.2} distortion={0.05} />
  </div>

  <main class="overflow-hidden">
    <section>
      <div class="relative pt-24 md:pt-36">
        <div class="mx-auto max-w-7xl px-6">
          <div class="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
            <h1 class="mt-8 text-6xl font-black text-balance md:text-7xl lg:mt-16 xl:text-[5.25rem]">MC-ID</h1>
            <p class="mx-auto mt-8 max-w-2xl text-lg text-balance">Most secure way to login with your Minecraft account, built for users and developers in mind.</p>

            <div class="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
              <Button href="/dashboard" size="lg" class="rounded-xl px-5 text-base backdrop-blur-lg">
                <span class="text-nowrap">Get Started</span>
              </Button>

              <Button href="#developers" size="lg" variant="ghost" class="rounded-xl px-5 transition-all dark:hover:bg-accent">For Developers</Button>
            </div>
          </div>
        </div>

        <div class="relative mt-8 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
          <div class="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg inset-shadow-2xs shadow-zinc-950/15 ring-background inset-shadow-white/20">
            {#key siteWidth.current}
              <div bind:this={minecraftAvatarContainer} class="relative w-full">
                {#if canvasIsLoading}
                  <div class="absolute size-full animate-pulse rounded-lg border border-border bg-accent"></div>
                {/if}
                <canvas bind:this={minecraftAvatar} class="relative size-full transform-gpu overflow-hidden rounded-lg opacity-0 transition-all duration-[3s] data-[loaded=true]:opacity-100" data-loaded={!canvasIsLoading}></canvas>
              </div>
            {/key}
          </div>
        </div>
      </div>
    </section>
  </main>
</div>
