<script lang="ts" module>
  import type { Icon as IconType } from "@lucide/svelte";
  import CodeXmlIcon from "@lucide/svelte/icons/code-xml";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import HouseIcon from "@lucide/svelte/icons/house";
  import Key from "@lucide/svelte/icons/key";
  import Link from "@lucide/svelte/icons/link";
  import MessageCircleMore from "@lucide/svelte/icons/message-circle-more";
  import Pickaxe from "@lucide/svelte/icons/pickaxe";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";
  import UserIcon from "@lucide/svelte/icons/user";

  type SingleNavItem = {
    name: string;
    url: string;
    icon: typeof IconType;
    subItems?: undefined;
    target?: "_blank" | "_self" | "_parent" | "_top";
  };

  type SubNavItem = Omit<SingleNavItem, "name" | "subItems"> & { title: string };

  type NestedNavItem = Pick<SingleNavItem, "name" | "icon"> & {
    subItems: SubNavItem[];
  };

  export type NavItem =
    | SingleNavItem
    // Item with subItems (no url)
    | NestedNavItem;

  const BASE_DASHBOARD_URL = "/dashboard";
  const BASE_DEVELOPER_URL = BASE_DASHBOARD_URL + "/developer";
  const BASE_SETTINGS_URL = BASE_DASHBOARD_URL + "/settings";
  const BASE_CONNECTIONS_URL = BASE_DASHBOARD_URL + "/connections";

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
      },
      {
        name: "Connections",
        icon: Link,
        subItems: [
          {
            title: "Minecraft",
            url: BASE_CONNECTIONS_URL + "/minecraft",
            icon: Pickaxe
          },
          {
            title: "Discord",
            url: BASE_CONNECTIONS_URL + "/discord",
            icon: MessageCircleMore
          }
        ]
      }
    ],
    navDeveloper: [
      {
        name: "Apps",
        url: BASE_DEVELOPER_URL + "/apps",
        icon: CodeXmlIcon
      },
      {
        name: "Keys",
        url: BASE_DEVELOPER_URL + "/keys",
        icon: Key
      },
      {
        name: "Documentation",
        url: "https://docs.mc-id.com",
        icon: ExternalLink,
        target: "_blank"
      },
      {
        name: "API Reference",
        url: "https://mc-id.com/api",
        icon: ExternalLink,
        target: "_blank"
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
    <Button href="/dashboard" class="flex items-center justify-start gap-2" variant="ghost">
      <enhanced:img src="$lib/assets/MC-ID-White.svg" class="pointer-events-none h-6 w-auto select-none" alt="MC-ID"></enhanced:img>
      {#if sidebar.open}
        <span class="text-lg">Minecraft ID</span>
      {/if}
    </Button>
  </Sidebar.Header>
  <Sidebar.Content>
    <Nav title="Dashboard" items={data.navMain} />
    <Nav title="Developer" items={data.navDeveloper} open={false} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
