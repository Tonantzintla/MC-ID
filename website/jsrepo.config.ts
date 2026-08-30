import oxfmt from "@jsrepo/transform-oxfmt";
import { defineConfig } from "jsrepo";

export default defineConfig({
  // configure where stuff comes from here
  registries: ["@ieedan/shadcn-svelte-extras"],
  // configure where stuff goes here
  paths: {
    ui: "$ui/extras",
    component: "$components",
    block: "$lib/components",
    hook: "$hooks/extras",
    action: "$actions/extras",
    util: "$utils",
    lib: "$lib"
  },
  transforms: [oxfmt()]
});
