import oxfmt from "@jsrepo/transform-oxfmt";
import { defineConfig } from "jsrepo";

export default defineConfig({
  registries: ["@ieedan/shadcn-svelte-extras"],
  paths: {
    ui: "$ui/extras",
    hook: "$lib/hooks/extras",
    action: "$lib/actions/extras",
    util: "$lib/utils",
    lib: "$lib",
    component: "$components",
    block: "$lib/components"
  },
  transforms: [oxfmt()]
});
