# MC-ID Docs

Documentation site for MC-ID, built with Astro and Starlight.

## Commands

Run these from the `docs/` directory.

| Command | Action |
| :-- | :-- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local docs server |
| `pnpm build` | Build the static site into `dist/` |
| `pnpm preview` | Preview the built site locally |
| `pnpm format` | Format docs files with Prettier |
| `pnpm lint` | Check docs formatting |

## Cloudflare Pages

Use the project-installed Astro dependencies when building on Cloudflare Pages.

- Build command: `pnpm build`
- Build output directory: `docs/dist`

Do not use `pnpm dlx astro build` on Cloudflare Pages. That installs a temporary Astro CLI outside the project and fails to load integrations such as `@astrojs/sitemap` from this docs app.
