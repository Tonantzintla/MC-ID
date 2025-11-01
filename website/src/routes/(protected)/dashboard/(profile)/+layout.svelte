<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import type { PrimaryMcAccount } from "$lib/types/global";
  import * as skinview3d from "skinview3d";
  import { untrack } from "svelte";
  import type { LayoutProps } from "./$types";

  const { children }: LayoutProps = $props();
  const primaryMcAccount = $derived<PrimaryMcAccount | undefined>(page.data?.primaryMcAccount);
  const disabledRoutes = new Set(["/dashboard/connections/discord"]);
  const shouldShow3DAvatar = $derived<boolean>(!disabledRoutes.has(page.url.pathname) && !!primaryMcAccount);

  let viewer: skinview3d.SkinViewer;
  let minecraftAvatarContainer = $state<HTMLDivElement>(null!);
  let minecraftAvatar = $state<HTMLCanvasElement>(null!);
  let canvasIsLoading = $state<boolean>(true);

  $effect.pre(() => {
    if (!browser || !primaryMcAccount || !minecraftAvatarContainer) return;
    const minecraftAvatarContainerDimensions = minecraftAvatarContainer.getBoundingClientRect();
    untrack(() => {
      viewer = new skinview3d.SkinViewer({
        canvas: minecraftAvatar,
        width: minecraftAvatarContainerDimensions.width,
        height: minecraftAvatarContainerDimensions.height,
        skin: `https://nmsr.nickac.dev/skin/${primaryMcAccount.uuid}`,
        enableControls: true,
        animation: new skinview3d.IdleAnimation(),
        nameTag: new skinview3d.NameTagObject(primaryMcAccount.username, { font: "3rem Minecraft" }),
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
  {#if browser && shouldShow3DAvatar}
    <div bind:this={minecraftAvatarContainer} class="relative w-full">
      {#if canvasIsLoading}
        <div class="absolute size-full animate-pulse rounded-lg border border-border bg-accent"></div>
      {/if}
      <canvas bind:this={minecraftAvatar} class="relative size-full translate-y-3 transform-gpu overflow-hidden rounded-lg opacity-0 transition-all duration-[3s] data-[loaded=true]:translate-y-0 data-[loaded=true]:opacity-100" data-loaded={!canvasIsLoading}></canvas>
    </div>
  {/if}

  {#if !primaryMcAccount}
    <Alert.Root>
      <Alert.Title>You don't have a primary Minecraft account set.</Alert.Title>
      <Alert.Description>
        <p>
          Please set a primary Minecraft account in <Button href="/dashboard/connections/minecraft" variant="link" class="px-0 underline underline-offset-2">Connections</Button> to get the full experience.
        </p>
      </Alert.Description>
    </Alert.Root>
  {/if}

  {@render children?.()}
</div>
