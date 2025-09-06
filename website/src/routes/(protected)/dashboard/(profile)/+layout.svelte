<script lang="ts">
  import { browser } from "$app/environment";
  import * as skinview3d from "skinview3d";
  import { untrack } from "svelte";
  import type { LayoutProps } from "./$types";

  const { data, children }: LayoutProps = $props();

  let viewer: skinview3d.SkinViewer;
  let minecraftAvatarContainer = $state<HTMLDivElement>(null!);
  let minecraftAvatar = $state<HTMLCanvasElement>(null!);
  let canvasIsLoading = $state<boolean>(true);

  $effect.pre(() => {
    if (!browser || !data.user || !minecraftAvatarContainer) return;
    const minecraftAvatarContainerDimensions = minecraftAvatarContainer.getBoundingClientRect();
    untrack(() => {
      viewer = new skinview3d.SkinViewer({
        canvas: minecraftAvatar,
        width: minecraftAvatarContainerDimensions.width,
        height: minecraftAvatarContainerDimensions.height,
        skin: `https://nmsr.nickac.dev/skin/${data.user?.id}`,
        enableControls: true,
        animation: new skinview3d.IdleAnimation(),
        nameTag: new skinview3d.NameTagObject(data.user?.name, { font: "3rem Minecraft" }),
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
</script>

<div class="mx-auto mb-8 flex max-w-xl flex-col justify-start gap-8 self-center px-2 md:px-0">
  {#if browser}
    <div bind:this={minecraftAvatarContainer} class="relative w-full">
      {#if canvasIsLoading}
        <div class="absolute size-full animate-pulse rounded-lg border border-border bg-accent"></div>
      {/if}
      <canvas bind:this={minecraftAvatar} class="relative size-full translate-y-3 transform-gpu overflow-hidden rounded-lg opacity-0 transition-all duration-[3s] data-[loaded=true]:translate-y-0 data-[loaded=true]:opacity-100" data-loaded={!canvasIsLoading}></canvas>
    </div>
  {/if}

  {@render children?.()}
</div>
