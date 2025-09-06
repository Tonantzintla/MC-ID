<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import Menu from "@lucide/svelte/icons/menu";
  import X from "@lucide/svelte/icons/x";
  import { scrollY } from "svelte/reactivity/window";

  type MenuItem = {
    name: string;
    href: string;
  };

  const { menuItems, showLoginButtons = true }: { menuItems: MenuItem[]; showLoginButtons?: boolean } = $props();

  let menuState = $state(false);
  let isScrolled = $derived.by(() => {
    if (scrollY.current !== undefined && scrollY.current > 50) return true;
    return false;
  });
</script>

<header>
  <nav class="fixed z-50 w-full px-2">
    <div class={cn(["mx-auto mt-0 max-w-6xl rounded-2xl border border-transparent px-6 transition-all duration-300 lg:px-12", isScrolled && "mt-2 max-w-4xl rounded-2xl border border-border bg-background/50 backdrop-blur-lg lg:px-5"])}>
      <div class="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
        <div class="flex w-full justify-between lg:w-auto">
          <a href="/" aria-label="home" class="flex items-center space-x-2">
            <enhanced:img src="$lib/assets/MC-ID-White.svg" class="pointer-events-none h-5.5 w-auto select-none group-hover/header:animate-spin" alt="MC-ID" />
          </a>

          <button onclick={() => (menuState = !menuState)} aria-label={menuState == true ? "Close Menu" : "Open Menu"} class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
            <Menu class={["m-auto size-6 duration-200", menuState && "scale-0 rotate-180 opacity-0"]} />
            <X class={["absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200", menuState && "scale-100 rotate-0 opacity-100"]} />
          </button>
        </div>

        <div class="absolute inset-0 m-auto hidden size-fit lg:block">
          <ul class="flex gap-8 text-sm">
            {#each menuItems as item, index (index)}
              <li>
                <a href={item.href} class="block text-muted-foreground duration-150 hover:text-accent-foreground">
                  <span>{item.name}</span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
        {#if showLoginButtons}
          <div class={cn(["mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent", menuState ? "block lg:flex" : "hidden lg:flex"])}>
            <div class="lg:hidden">
              <ul class="space-y-6 text-base">
                {#each menuItems as item, index (index)}
                  <li>
                    <Button href={item.href} variant="link" class="block text-muted-foreground duration-150 hover:text-accent-foreground">
                      <span>{item.name}</span>
                    </Button>
                  </li>
                {/each}
              </ul>
            </div>
            <div class="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
              <Button variant="outline" size="sm" href="/login">Login</Button>
              <Button href="/login" size="sm">Sign Up</Button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </nav>
</header>
