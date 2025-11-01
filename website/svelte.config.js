import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { betterSvelteEmailPreprocessor } from "better-svelte-email";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), betterSvelteEmailPreprocessor()],

  compilerOptions: {
    experimental: {
      async: true
    }
  },

  kit: {
    experimental: {
      remoteFunctions: true
    },
    adapter: adapter({
      precompress: true
    }),

    csp: {
      mode: "hash"
    },

    csrf: {
      // Only disable if in development mode
      trustedOrigins: ["https://mc-id.com", "https://api.mc-id.com", "https://auth.mc-id.com", "https://docs.mc-id.com"]
    },

    alias: {
      $ui: "./src/lib/components/ui",
      $components: "./src/lib/components",
      $stores: "./src/lib/stores",
      $lib: "./src/lib",
      $params: "./src/params",
      $content: "./src/content",
      $css: "./src/app.css",
      $api: "./src/api"
    }
  }
};

export default config;
