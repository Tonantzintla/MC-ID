// @ts-check
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.mc-id.com",
  integrations: [
    starlight({
      title: "MC-ID",
      logo: {
        dark: "./src/assets/MC-ID.svg",
        light: "./src/assets/MC-ID-BG.svg",
        replacesTitle: true
      },
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/Tonantzintla/MC-ID" }],
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" }
          ]
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" }
        }
      ],
      editLink: {
        baseUrl: "https://github.com/Tonantzintla/MC-ID/edit/master/docs/"
      },
      customCss: ["./src/styles/global.css"],
      plugins: []
    }),
    sitemap()
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
