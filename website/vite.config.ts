import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), path.resolve("..")]
    }
  },
  plugins: [enhancedImages(), tailwindcss(), sveltekit(), devtoolsJson()],
  resolve: {
    alias: {
      $ui: path.resolve("./src/lib/components/ui"),
      $components: path.resolve("./src/lib/components"),
      $stores: path.resolve("./src/lib/stores"),
      $db: path.resolve("./src/lib/server/db"),
      $lib: path.resolve("./src/lib"),
      $params: path.resolve("./src/params")
    },
    external: ["better-auth"]
  },
  ssr: {
    external: ["better-auth"]
  },
  build: {
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ["@node-rs/argon2"]
  }
});
