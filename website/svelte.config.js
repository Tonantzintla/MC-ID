import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * Determine whether to force runes mode for a given filename
 * @param {string} filename
 * @returns {boolean}
 */
const forceRunesMode = (filename) => {
  if (filename.match(/[\\/\\]node_modules[\\/\\]/)) {
    return false;
  }
  return true;
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess()],

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
      $api: "./src/api"
    }
  },
  // Hide build warnings from node_modules
  onwarn: (warning, handler) => {
    if (warning.filename?.includes("node_modules")) return;
    handler(warning);
  },
  vitePlugin: {
    // Can be removed once Svelte 6 is released, as `true` will be the default
    dynamicCompileOptions({ filename, compileOptions }) {
      // Dynamically set runes mode per Svelte file
      if (forceRunesMode(filename) && !compileOptions.runes) {
        return { runes: true };
      }
    }
  }
};

export default config;
