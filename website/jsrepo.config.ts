import prettier from "@jsrepo/transform-prettier";
import { defineConfig } from "jsrepo";

export default defineConfig({
  registries: ["@ieedan/shadcn-svelte-extras"],
  paths: {
    "*": "$components/blocks",
    ui: "$components/ui/extras",
    actions: "$lib/actions/extras",
    hooks: "$lib/hooks/extras",
    utils: "$lib/utils",
    lib: "$lib"
  },
  transforms: [prettier()]
});
