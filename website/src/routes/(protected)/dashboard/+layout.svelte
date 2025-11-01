<script lang="ts">
  import { page } from "$app/state";
  import AppSidebar from "$components/app-sidebar.svelte";
  import type { PrimaryMcAccount } from "$lib/types/global";
  import * as Breadcrumb from "$ui/breadcrumb";
  import { Separator } from "$ui/separator";
  import * as Sidebar from "$ui/sidebar";
  import type { LayoutProps } from "./$types";

  const primaryMcAccount = $derived<PrimaryMcAccount | undefined>(page.data?.primaryMcAccount);
  let { children }: LayoutProps = $props();

  function generateBreadcrumbs(path: string): { label: string; href: string | null }[] {
    // base is /dashboard, so if its /dashboard we return just the home breadcrumb
    if (path === "/dashboard") return [{ label: "Home", href: "/dashboard" }];

    // split the path by '/' and filter out empty segments
    const segments = path.split("/").filter((segment) => segment && segment !== "dashboard");

    // Define segments that are purely organizational and don't have pages
    const organizationalSegments = new Set(["developer"]);

    // build cumulative paths for each segment
    const breadcrumbs = [{ label: "Home", href: "/dashboard" }];
    let currentPath = "/dashboard";

    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: organizationalSegments.has(segment) ? "" : currentPath
      });
    });

    return breadcrumbs;
  }
</script>

<Sidebar.Provider>
  {#if primaryMcAccount}
    <AppSidebar />
  {/if}
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div class="flex items-center gap-2 px-4">
        {#if primaryMcAccount}
          <Sidebar.Trigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        {/if}
        <Breadcrumb.Root>
          <Breadcrumb.List>
            {#each generateBreadcrumbs(page.url.pathname) as breadcrumb, index (index)}
              {@const isLast = index === generateBreadcrumbs(page.url.pathname).length - 1}
              {@const isOrganizational = breadcrumb.href === null}
              <Breadcrumb.Item>
                {#if isLast}
                  <Breadcrumb.Page class="capitalize">{breadcrumb.label}</Breadcrumb.Page>
                {:else if isOrganizational}
                  <Breadcrumb.Page class="text-muted-foreground capitalize">{breadcrumb.label}</Breadcrumb.Page>
                {:else}
                  <Breadcrumb.Link class="capitalize" href={breadcrumb.href}>{breadcrumb.label}</Breadcrumb.Link>
                {/if}
              </Breadcrumb.Item>
              {#if !isLast}
                <Breadcrumb.Separator />
              {/if}
            {/each}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
    </header>
    <main>
      {@render children?.()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
