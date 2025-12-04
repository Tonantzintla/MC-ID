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
          label: "Getting Started",
          items: [{ label: "Introduction", slug: "getting-started/introduction" }]
        },
        {
          label: "Guides",
          items: [
            { label: "Vanilla JS", slug: "guides/vanilla-js" },
            { label: "Better-Auth", slug: "guides/better-auth" }
          ]
        },
        {
          label: "Advanced",
          items: [
            { label: "Headless Flow", slug: "advanced/headless-flow", badge: { text: "Discouraged", variant: "caution" } },
            { label: "Manual OIDC", slug: "advanced/manual-oidc" }
          ],
          collapsed: true
        },
        {
          label: "Reference",
          items: [
            {
              label: "Headless API",
              link: "https://mc-id.com/api#mc-id-api",
              attrs: { target: "_blank" }
            },
            {
              label: "OIDC API",
              link: "https://mc-id.com/api#better-auth-api/tag/oidc",
              attrs: { target: "_blank" }
            }
          ],
          collapsed: true
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
