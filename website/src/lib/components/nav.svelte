<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { NavItem } from "$components/app-sidebar.svelte";
  import * as Sidebar from "$components/ui/sidebar/index.js";
  import * as Collapsible from "$ui/collapsible";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";

  let {
    items,
    title,
    open = $bindable(true)
  }: {
    items: NavItem[];
    title: string;
    open?: boolean;
  } = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Collapsible.Root bind:open class="group/collapsible-title">
    <Sidebar.GroupLabel class="mb-1 w-full text-left hover:bg-sidebar-accent">
      {#snippet child({ props })}
        <Collapsible.Trigger {...props}>
          <div class="w-full">{title}</div>
          <ChevronRightIcon class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-title:rotate-90" />
        </Collapsible.Trigger>
      {/snippet}
    </Sidebar.GroupLabel>
    <Collapsible.Content forceMount>
      {#snippet child({ props, open })}
        {#if open}
          <div {...props} transition:slide={{ duration: 150, easing: cubicOut, axis: "y" }}>
            <Sidebar.Menu>
              {#each items as item (item.name)}
                {#if !item.subItems}
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive={page.url.pathname.endsWith(item.url)} tooltipContent={item.name}>
                      {#snippet child({ props })}
                        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve @typescript-eslint/no-explicit-any -->
                        <a href={item.target === "_blank" ? item.url : resolve(item.url as any)} {...props} target={item.target}>
                          <item.icon />
                          <span>{item.name}</span>
                        </a>
                      {/snippet}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                {:else}
                  <Collapsible.Root open={item.subItems.find((subItem) => page.url.pathname.includes(subItem.url)) !== undefined} class="group/collapsible">
                    {#snippet child({ props })}
                      <Sidebar.MenuItem {...props}>
                        <Collapsible.Trigger>
                          {#snippet child({ props })}
                            <Sidebar.MenuButton {...props} isActive={item.subItems.find((subItem) => page.url.pathname.includes(subItem.url)) !== undefined} tooltipContent={item.name} class="group-data-[state=open]/collapsible:data-[active=true]:bg-transparent">
                              <item.icon />

                              <span>{item.name}</span>
                              <ChevronRightIcon class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </Sidebar.MenuButton>
                          {/snippet}
                        </Collapsible.Trigger>
                        <Collapsible.Content forceMount>
                          {#snippet child({ props: subItemProps, open: subItemOpen })}
                            {#if subItemOpen}
                              <div {...subItemProps} transition:slide={{ duration: 150, easing: cubicOut, axis: "y" }}>
                                <Sidebar.MenuSub>
                                  {#each item.subItems ?? [] as subItem (subItem.title)}
                                    <Sidebar.MenuSubItem>
                                      <Sidebar.MenuSubButton isActive={page.url.pathname.endsWith(subItem.url)}>
                                        {#snippet child({ props })}
                                          <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
                                          <a href={resolve(subItem.url as any)} {...props} target={subItem.target}>
                                            <subItem.icon />
                                            <span>{subItem.title}</span>
                                          </a>
                                        {/snippet}
                                      </Sidebar.MenuSubButton>
                                    </Sidebar.MenuSubItem>
                                  {/each}
                                </Sidebar.MenuSub>
                              </div>
                            {/if}
                          {/snippet}
                        </Collapsible.Content>
                      </Sidebar.MenuItem>
                    {/snippet}
                  </Collapsible.Root>
                {/if}
              {/each}
            </Sidebar.Menu>
          </div>
        {/if}
      {/snippet}
    </Collapsible.Content>
  </Collapsible.Root>
</Sidebar.Group>
