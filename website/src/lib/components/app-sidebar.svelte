<script lang="ts" module>
  import type { Icon as IconType } from "@lucide/svelte";
  import CodeXmlIcon from "@lucide/svelte/icons/code-xml";
  import HouseIcon from "@lucide/svelte/icons/house";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";
  import UserIcon from "@lucide/svelte/icons/user";

  export type NavItem =
    | {
        name: string;
        url: string;
        icon: typeof IconType;
        subItems?: undefined;
      }
    // Item with subItems (no url)
    | {
        name: string;
        icon: typeof IconType;
        subItems: {
          title: string;
          url: string;
          icon: typeof IconType;
        }[];
        url?: undefined;
      };

  const BASE_DASHBOARD_URL = "/dashboard";
  const BASE_DEVELOPER_URL = BASE_DASHBOARD_URL + "/developer";
  const BASE_SETTINGS_URL = BASE_DASHBOARD_URL + "/settings";

  const data = {
    navMain: [
      {
        name: "Home",
        url: BASE_DASHBOARD_URL,
        icon: HouseIcon
      },
      {
        name: "Settings",
        icon: Settings2Icon,
        subItems: [
          {
            title: "Profile",
            url: BASE_SETTINGS_URL + "/profile",
            icon: UserIcon
          },
          {
            title: "Security",
            url: BASE_SETTINGS_URL + "/security",
            icon: Settings2Icon
          }
        ]
      }
    ],
    navDeveloper: [
      {
        name: "Apps",
        url: BASE_DEVELOPER_URL + "/apps",
        icon: CodeXmlIcon
      }
    ]
  } as const satisfies Record<string, NavItem[]>;
</script>

<script lang="ts">
  import { Button } from "$ui/button";
  import * as Sidebar from "$ui/sidebar";
  import { useSidebar } from "$ui/sidebar/context.svelte";
  import type { ComponentProps } from "svelte";
  import NavUser from "./nav-user.svelte";
  import Nav from "./nav.svelte";

  const sidebar = useSidebar();

  let { ref = $bindable(null), collapsible = "offcanvas", ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <Button href="/dashboard" class="group/header flex items-center justify-start gap-2" variant="ghost">
      <enhanced:img src="$lib/assets/MC-ID-White.svg" class="pointer-events-none h-6 w-auto select-none group-hover/header:animate-spin" alt="MC-ID" />
      {#if sidebar.open}
        <span class="text-lg">Minecraft ID</span>
      {/if}
    </Button>
  </Sidebar.Header>
  <Sidebar.Content>
    <Nav title="Dashboard" items={data.navMain} />
    <Nav title="Developer" items={data.navDeveloper} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
