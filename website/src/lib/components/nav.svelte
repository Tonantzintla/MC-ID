<script lang="ts">
  import { page } from "$app/state";
  import type { NavItem } from "$components/app-sidebar.svelte";
  import * as Sidebar from "$components/ui/sidebar/index.js";
  import * as Collapsible from "$ui/collapsible";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

  const {
    items,
    title
  }: {
    items: NavItem[];
    title: string;
  } = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.GroupLabel>{title}</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as item (item.name)}
      {#if !item.subItems}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton isActive={page.url.pathname.endsWith(item.url)} tooltipContent={item.name}>
            {#snippet child({ props })}
              <a href={item.url} {...props}>
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
              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each item.subItems ?? [] as subItem (subItem.title)}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton isActive={page.url.pathname.endsWith(subItem.url)}>
                        {#snippet child({ props })}
                          <a href={subItem.url} {...props}>
                            <subItem.icon />
                            <span>{subItem.title}</span>
                          </a>
                        {/snippet}
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              </Collapsible.Content>
            </Sidebar.MenuItem>
          {/snippet}
        </Collapsible.Root>
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
