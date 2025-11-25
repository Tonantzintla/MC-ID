import prettier from "@jsrepo/transform-prettier";
import { defineConfig } from "jsrepo";

export default defineConfig({
  registries: ["@ieedan/shadcn-svelte-extras"],
  paths: {
    ui: "$components/ui/extras",
    hook: "$lib/hooks/extras",
    action: "$lib/actions/extras",
    util: "$lib/utils",
    lib: "$lib"
  },
  transforms: [prettier()]
});
