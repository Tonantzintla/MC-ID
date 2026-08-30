import path from "path";
import adapter from "@sveltejs/adapter-node";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";

export default defineConfig({
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), path.resolve("..")]
    }
  },
  plugins: [
    enhancedImages(),
    tailwindcss(),
    sveltekit({
      // Consult https://svelte.dev/docs/kit/integrations
      // for more information about preprocessors
      preprocess: vitePreprocess(),

      compilerOptions: {
        experimental: {
          async: true
        },
        runes: true
      },

      experimental: {
        remoteFunctions: true
      },
      adapter: adapter({
        precompress: true
      }),

      csp: {
        mode: "auto",
        directives: {
          "script-src": ["self", "unsafe-inline", "wasm-unsafe-eval"],
          "style-src": ["self", "unsafe-inline"],
          "img-src": [
            "self",
            "data:",
            "https://mc-id.com",
            "https://nmsr.nickac.dev",
            "https://cdn.discordapp.com",
            "https:"
          ],
          "connect-src": ["self", "https://mc-id.com"],
          "font-src": ["self"],
          "worker-src": ["self"]
        }
      },

      csrf: {
        trustedOrigins: ["*"]
      },

      alias: {
        $ui: "./src/lib/components/ui",
        $components: "./src/lib/components",
        $stores: "./src/lib/stores",
        $lib: "./src/lib",
        $params: "./src/params",
        $content: "./src/content",
        $css: "./src/app.css",
        $api: "./src/api",
        $src: "./src"
      },

      typescript: {
        config: (config) => ({
          ...config,
          include: [...config.include, "./drizzle.config.ts"]
        })
      },

      vitePlugin: {
        experimental: {
          sendWarningsToBrowser: process.env.NODE_ENV === "development"
        },
        inspector: process.env.NODE_ENV === "development"
      }
    })
  ],
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
