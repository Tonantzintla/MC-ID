# Changelog


## v3.0.4

[compare changes](https://github.com/Tonantzintla/MC-ID/compare/v3.0.3...v3.0.4)

### 💅 Refactors

- Streamline release notes generation by linking to the full changelog instead of parsing it. ([5f000d7](https://github.com/Tonantzintla/MC-ID/commit/5f000d7))

## v3.0.3

[compare changes](https://github.com/Tonantzintla/MC-ID/compare/v3.0.2...v3.0.3)

### 🩹 Fixes

- Improve release notes extraction robustness with error handling and a fallback message for `RELEASE_NOTES.md` generation. ([e11cea0](https://github.com/Tonantzintla/MC-ID/commit/e11cea0))

## v3.0.2

[compare changes](https://github.com/Tonantzintla/MC-ID/compare/v3.0.1...v3.0.2)

### 🩹 Fixes

- Extract release notes from CHANGELOG.md and use them when creating a GitHub release, replacing `changelogen` and separate artifact upload. ([e5737b6](https://github.com/Tonantzintla/MC-ID/commit/e5737b6))

## v3.0.1

[compare changes](https://github.com/Tonantzintla/MC-ID/compare/v2.2.0...v3.0.1)

### 🩹 Fixes

- Bump project version to 3.0.0 ([39d2f78](https://github.com/Tonantzintla/MC-ID/commit/39d2f78))

## v2.2.0


### 🚀 Enhancements

- Some changes ([c13049e](https://github.com/Tonantzintla/MC-ID/commit/c13049e))
- Update configuration for Tailwind integration; remove Svelte support ([f6b9771](https://github.com/Tonantzintla/MC-ID/commit/f6b9771))
- Implement API key management and user signup flow ([0b1b54d](https://github.com/Tonantzintla/MC-ID/commit/0b1b54d))
- Add email verification and password reset functionality ([ac9f6c6](https://github.com/Tonantzintla/MC-ID/commit/ac9f6c6))
- Integrate Redis for secondary storage in authentication ([345216f](https://github.com/Tonantzintla/MC-ID/commit/345216f))
- Add rate limit configuration to use secondary storage ([cc1e444](https://github.com/Tonantzintla/MC-ID/commit/cc1e444))
- Skip email sending in development for password reset and verification ([1c7e7f4](https://github.com/Tonantzintla/MC-ID/commit/1c7e7f4))
- Enforce email verification before creating OAuth applications and API keys ([ca7df1a](https://github.com/Tonantzintla/MC-ID/commit/ca7df1a))
- Implement email verification handling in user profile and developer settings ([3811268](https://github.com/Tonantzintla/MC-ID/commit/3811268))
- Enforce email verification before creating OAuth applications and API keys ([e0bf095](https://github.com/Tonantzintla/MC-ID/commit/e0bf095))
- Add Gradle wrapper and CI workflow ([ff0b725](https://github.com/Tonantzintla/MC-ID/commit/ff0b725))
- Add workflow_dispatch inputs for force release and release type ([6f39b5e](https://github.com/Tonantzintla/MC-ID/commit/6f39b5e))
- Enhance workflow_dispatch to support forced releases with versioning ([8e31670](https://github.com/Tonantzintla/MC-ID/commit/8e31670))
- Add shadcn-svelte component "empty" ([89f7642](https://github.com/Tonantzintla/MC-ID/commit/89f7642))
- Add shadcn-svelte component "item" ([d26add7](https://github.com/Tonantzintla/MC-ID/commit/d26add7))
- Add shadcn-svelte component "popover" ([be545a5](https://github.com/Tonantzintla/MC-ID/commit/be545a5))
- Add shadcn-svelte component "scroll-area" ([022236f](https://github.com/Tonantzintla/MC-ID/commit/022236f))
- Add shadcn-svelte component "seperator" ([96a7606](https://github.com/Tonantzintla/MC-ID/commit/96a7606))
- Add shadcn-svelte component "spinner" ([ba4f81f](https://github.com/Tonantzintla/MC-ID/commit/ba4f81f))
- Add is-hover hook ([30d3bf1](https://github.com/Tonantzintla/MC-ID/commit/30d3bf1))
- Add CODEOWNERS file for repository maintainers ([343ad41](https://github.com/Tonantzintla/MC-ID/commit/343ad41))
- Simplify secret reset by removing hashing ([3610a2f](https://github.com/Tonantzintla/MC-ID/commit/3610a2f))
- Enhance scopes with consent descriptions for clarity ([34b43ea](https://github.com/Tonantzintla/MC-ID/commit/34b43ea))
- Implement OAuth consent flow with additional user info retrieval ([141acc4](https://github.com/Tonantzintla/MC-ID/commit/141acc4))
- Add database cleanup cron job for expired entries ([aee8f7c](https://github.com/Tonantzintla/MC-ID/commit/aee8f7c))
- Enhance protected route handling for authenticated users ([c6566f1](https://github.com/Tonantzintla/MC-ID/commit/c6566f1))
- Remove MC-ID login functionality and related components ([4d35332](https://github.com/Tonantzintla/MC-ID/commit/4d35332))
- Remove MC login form validation from the login route ([e3d011e](https://github.com/Tonantzintla/MC-ID/commit/e3d011e))
- Add shadcn-svelte input-otp component ([68f0bc3](https://github.com/Tonantzintla/MC-ID/commit/68f0bc3))
- Implement Minecraft account linking and verification flow ([011dbfb](https://github.com/Tonantzintla/MC-ID/commit/011dbfb))
- Remove username validation schema and related code ([dbb0a32](https://github.com/Tonantzintla/MC-ID/commit/dbb0a32))
- Update environment variables for MCID API integration ([8bddc55](https://github.com/Tonantzintla/MC-ID/commit/8bddc55))
- Integrate primary Minecraft account handling across components and routes ([f46940e](https://github.com/Tonantzintla/MC-ID/commit/f46940e))
- Add default UUID generation for primary key in minecraft_account table ([51924d8](https://github.com/Tonantzintla/MC-ID/commit/51924d8))
- Simplify user update payload by removing redundant fields ([6cfb7b5](https://github.com/Tonantzintla/MC-ID/commit/6cfb7b5))
- Streamline API key creation process by removing unnecessary request headers and adding loading spinner ([9a8e518](https://github.com/Tonantzintla/MC-ID/commit/9a8e518))
- Migrate email templates from React to Svelte ([cca8e99](https://github.com/Tonantzintla/MC-ID/commit/cca8e99))
- Update configuration files ([e7caf0f](https://github.com/Tonantzintla/MC-ID/commit/e7caf0f))
- Add Svelte SEO integration for improved metadata handling ([72c907e](https://github.com/Tonantzintla/MC-ID/commit/72c907e))
- Add dynamic runes mode handling and warning suppression in Svelte config ([4bc95ff](https://github.com/Tonantzintla/MC-ID/commit/4bc95ff))
- Redesign home page ([7987603](https://github.com/Tonantzintla/MC-ID/commit/7987603))
- Migrate to jsrepo 3 ([132a186](https://github.com/Tonantzintla/MC-ID/commit/132a186))
- Enhance dashboard with quick links and user greeting ([1e45dc3](https://github.com/Tonantzintla/MC-ID/commit/1e45dc3))
- Migrate better-svelte-email to v1 ([60b90f9](https://github.com/Tonantzintla/MC-ID/commit/60b90f9))
- Update deps ([c373d30](https://github.com/Tonantzintla/MC-ID/commit/c373d30))
- Update better-auth ([a31c46e](https://github.com/Tonantzintla/MC-ID/commit/a31c46e))
- Add field error handling to app form and improve URI validation ([89d533e](https://github.com/Tonantzintla/MC-ID/commit/89d533e))
- Change form validation method from 'oninput' to 'onblur' across multiple forms ([f681fa0](https://github.com/Tonantzintla/MC-ID/commit/f681fa0))
- Update button labels for clarity in app form ([9d99fc1](https://github.com/Tonantzintla/MC-ID/commit/9d99fc1))
- Update API reference URL and adjust trusted origins in config ([d97f458](https://github.com/Tonantzintla/MC-ID/commit/d97f458))
- Add autocomplete attributes for password fields in security settings ([fd36769](https://github.com/Tonantzintla/MC-ID/commit/fd36769))
- Switch to minimal import for better-auth in auth configuration ([d9143a6](https://github.com/Tonantzintla/MC-ID/commit/d9143a6))
- Implement code request and verification system with new database schema and API endpoints. ([6885bfc](https://github.com/Tonantzintla/MC-ID/commit/6885bfc))
- Introduce automated release workflow with conventional commits and separate CI build. ([2bbe461](https://github.com/Tonantzintla/MC-ID/commit/2bbe461))
- Update GitHub Actions versions for checkout, setup-node, setup-java, setup-gradle, and pnpm setup. ([28c4627](https://github.com/Tonantzintla/MC-ID/commit/28c4627))
- Bump project version to 2.1.0. ([8108507](https://github.com/Tonantzintla/MC-ID/commit/8108507))

### 🩹 Fixes

- Update package name and license in package.json ([cae217d](https://github.com/Tonantzintla/MC-ID/commit/cae217d))
- Update GitHub link in header menu items ([1335f61](https://github.com/Tonantzintla/MC-ID/commit/1335f61))
- Update zod version to 4.0.10 in package.json and pnpm-lock.yaml; remove pnpm config from website package.json ([e8578a7](https://github.com/Tonantzintla/MC-ID/commit/e8578a7))
- Standardize pnpm configuration in package.json files; update zod version to 4.0.10 ([3afd7a5](https://github.com/Tonantzintla/MC-ID/commit/3afd7a5))
- Update .env.example to include Discord client credentials and address header ([8949626](https://github.com/Tonantzintla/MC-ID/commit/8949626))
- Update README files to remove references to the deprecated MC-ID API ([45932a1](https://github.com/Tonantzintla/MC-ID/commit/45932a1))
- Update authentication configuration to use hardcoded client credentials for now ([69ecd53](https://github.com/Tonantzintla/MC-ID/commit/69ecd53))
- Remove unused trusted provider "mc-id" from account linking ([b9beb3e](https://github.com/Tonantzintla/MC-ID/commit/b9beb3e))
- Forward the ORPC errors as they are being caught in the try catch, resulting in 500 errors when they're not ([6de4a49](https://github.com/Tonantzintla/MC-ID/commit/6de4a49))
- Refactor DATABASE_URL handling for improved clarity and consistency ([96cac63](https://github.com/Tonantzintla/MC-ID/commit/96cac63))
- Update ESLint configuration to use defineConfig as ts.config is deprecated ([44e4956](https://github.com/Tonantzintla/MC-ID/commit/44e4956))
- Enhance DATABASE_URL validation to account for building environment ([49edcbe](https://github.com/Tonantzintla/MC-ID/commit/49edcbe))
- Remove building environment check for DATABASE_URL in configuration ([e28c169](https://github.com/Tonantzintla/MC-ID/commit/e28c169))
- Downgrade sveltekit for now #14590 ([#14590](https://github.com/Tonantzintla/MC-ID/issues/14590))
- Keep react and react-dom version in sync ([17f82b4](https://github.com/Tonantzintla/MC-ID/commit/17f82b4))
- Remove maxlength attribute from email input in login form ([456f6ba](https://github.com/Tonantzintla/MC-ID/commit/456f6ba))
- Update API key header in ApiHandler and remove unused appName field from PlayerCodeResponse ([346f1a1](https://github.com/Tonantzintla/MC-ID/commit/346f1a1))
- Simplify verification code message and remove appName reference ([827c21e](https://github.com/Tonantzintla/MC-ID/commit/827c21e))
- Adjust API endpoint resolution to ensure correct path structure ([b559739](https://github.com/Tonantzintla/MC-ID/commit/b559739))
- Update versioning to use environment variable for CI builds ([e29312b](https://github.com/Tonantzintla/MC-ID/commit/e29312b))
- Refactor GitHub Actions workflow for versioning and release management ([f896af8](https://github.com/Tonantzintla/MC-ID/commit/f896af8))
- Update README to clarify API endpoint and key configuration ([5853d56](https://github.com/Tonantzintla/MC-ID/commit/5853d56))
- Improve tag detection and commit logging for versioning ([88029fd](https://github.com/Tonantzintla/MC-ID/commit/88029fd))
- Update build command and API reference in CONTRIBUTING.md ([af085ff](https://github.com/Tonantzintla/MC-ID/commit/af085ff))
- Enhance release notes generation to handle missing tags ([ebe5835](https://github.com/Tonantzintla/MC-ID/commit/ebe5835))
- Reorder steps in CONTRIBUTING.md for clarity ([cfa0e0b](https://github.com/Tonantzintla/MC-ID/commit/cfa0e0b))
- Add tagging step to create and push version tags during release ([012dae4](https://github.com/Tonantzintla/MC-ID/commit/012dae4))
- Test release workflow with explicit tag creation ([ba47ea5](https://github.com/Tonantzintla/MC-ID/commit/ba47ea5))
- Add permissions section to build-plugin.yml for content write access ([ca96526](https://github.com/Tonantzintla/MC-ID/commit/ca96526))
- Ensure PAT_TOKEN is used for checkout and release steps in build-plugin.yml ([5f8b66e](https://github.com/Tonantzintla/MC-ID/commit/5f8b66e))
- Add tagging step to release workflow for versioning ([b1fe20b](https://github.com/Tonantzintla/MC-ID/commit/b1fe20b))
- Replace PAT_TOKEN with GITHUB_TOKEN for authentication in build-plugin.yml ([55239ea](https://github.com/Tonantzintla/MC-ID/commit/55239ea))
- Remove testing password reset button from profile settings ([17d1596](https://github.com/Tonantzintla/MC-ID/commit/17d1596))
- Node-cron must be a regular dependency ([2edc9b4](https://github.com/Tonantzintla/MC-ID/commit/2edc9b4))
- Ensure process exits cleanly on SvelteKit shutdown ([8c226d7](https://github.com/Tonantzintla/MC-ID/commit/8c226d7))
- Eslint errors ([22cc6b4](https://github.com/Tonantzintla/MC-ID/commit/22cc6b4))
- Sveltekit-checke errors ([ec801ff](https://github.com/Tonantzintla/MC-ID/commit/ec801ff))
- Update base and production node version to 24-alpine ([1e040b4](https://github.com/Tonantzintla/MC-ID/commit/1e040b4))
- Update email rendering ([86dc7be](https://github.com/Tonantzintla/MC-ID/commit/86dc7be))

### 💅 Refactors

- **api:** Migrate the api to use orpc ([cf17331](https://github.com/Tonantzintla/MC-ID/commit/cf17331))

### 📖 Documentation

- Update README files to correct project links and descriptions ([7460900](https://github.com/Tonantzintla/MC-ID/commit/7460900))
- Update README files to include additional project links and descriptions ([3953f67](https://github.com/Tonantzintla/MC-ID/commit/3953f67))
- Format ([e17a609](https://github.com/Tonantzintla/MC-ID/commit/e17a609))
- Adjust image alignment in README.md ([f721ce2](https://github.com/Tonantzintla/MC-ID/commit/f721ce2))

### 🏡 Chore

- Update README and add LICENSE file ([6758bf2](https://github.com/Tonantzintla/MC-ID/commit/6758bf2))
- Add package.json and pnpm-workspace.yaml files ([0386143](https://github.com/Tonantzintla/MC-ID/commit/0386143))
- Add .gitignore file to exclude IDE and build artifacts ([1399af9](https://github.com/Tonantzintla/MC-ID/commit/1399af9))
- Remove pnpm-lock.yaml, yarn.lock, and package-lock.json from .gitignore ([7cabc43](https://github.com/Tonantzintla/MC-ID/commit/7cabc43))
- Delete the api project as it has been migrated to the website itself ([78f60c5](https://github.com/Tonantzintla/MC-ID/commit/78f60c5))
- Update deps ([cca25f5](https://github.com/Tonantzintla/MC-ID/commit/cca25f5))
- Prettier format ([34db5a1](https://github.com/Tonantzintla/MC-ID/commit/34db5a1))
- Update deps ([7b19451](https://github.com/Tonantzintla/MC-ID/commit/7b19451))
- Update shadcn-svelte components ([bbf82f7](https://github.com/Tonantzintla/MC-ID/commit/bbf82f7))
- Update deps ([2f8744c](https://github.com/Tonantzintla/MC-ID/commit/2f8744c))
- Update pnpm-lock file ([f0bacc3](https://github.com/Tonantzintla/MC-ID/commit/f0bacc3))
- Prettier format ([01d5919](https://github.com/Tonantzintla/MC-ID/commit/01d5919))
- **deps-dev:** Bump sveltekit-superforms from 2.27.1 to 2.27.4 ([f5fcc58](https://github.com/Tonantzintla/MC-ID/commit/f5fcc58))
- **deps-dev:** Bump sveltekit-superforms in /website ([5387c99](https://github.com/Tonantzintla/MC-ID/commit/5387c99))
- Prettier format ([19f1fdf](https://github.com/Tonantzintla/MC-ID/commit/19f1fdf))
- Update shadcn-svelte components ([d9770a2](https://github.com/Tonantzintla/MC-ID/commit/d9770a2))
- Prettier format ([73e6546](https://github.com/Tonantzintla/MC-ID/commit/73e6546))
- Update deps ([72b583f](https://github.com/Tonantzintla/MC-ID/commit/72b583f))
- Update shadcn-svelte-extras components ([37b902b](https://github.com/Tonantzintla/MC-ID/commit/37b902b))
- Update deps ([4c1e55b](https://github.com/Tonantzintla/MC-ID/commit/4c1e55b))
- Update pnpm to 10.23.0 and remove explicit version from CI workflow. ([bb1661a](https://github.com/Tonantzintla/MC-ID/commit/bb1661a))
- Add CHANGELOG.md and remove explicit GITHUB_TOKEN from release workflow. ([ac27825](https://github.com/Tonantzintla/MC-ID/commit/ac27825))
- **release:** V1.1.0 [skip ci] ([e33f038](https://github.com/Tonantzintla/MC-ID/commit/e33f038))

### 🎨 Styles

- Remove quotes from package names in pnpm-workspace.yaml ([97b437e](https://github.com/Tonantzintla/MC-ID/commit/97b437e))

### ❤️ Contributors

- DarthGigi ([@DarthGigi](https://github.com/DarthGigi))

## v1.1.0


### 🚀 Enhancements

- Some changes ([c13049e](https://github.com/Tonantzintla/MC-ID/commit/c13049e))
- Update configuration for Tailwind integration; remove Svelte support ([f6b9771](https://github.com/Tonantzintla/MC-ID/commit/f6b9771))
- Implement API key management and user signup flow ([0b1b54d](https://github.com/Tonantzintla/MC-ID/commit/0b1b54d))
- Add email verification and password reset functionality ([ac9f6c6](https://github.com/Tonantzintla/MC-ID/commit/ac9f6c6))
- Integrate Redis for secondary storage in authentication ([345216f](https://github.com/Tonantzintla/MC-ID/commit/345216f))
- Add rate limit configuration to use secondary storage ([cc1e444](https://github.com/Tonantzintla/MC-ID/commit/cc1e444))
- Skip email sending in development for password reset and verification ([1c7e7f4](https://github.com/Tonantzintla/MC-ID/commit/1c7e7f4))
- Enforce email verification before creating OAuth applications and API keys ([ca7df1a](https://github.com/Tonantzintla/MC-ID/commit/ca7df1a))
- Implement email verification handling in user profile and developer settings ([3811268](https://github.com/Tonantzintla/MC-ID/commit/3811268))
- Enforce email verification before creating OAuth applications and API keys ([e0bf095](https://github.com/Tonantzintla/MC-ID/commit/e0bf095))
- Add Gradle wrapper and CI workflow ([ff0b725](https://github.com/Tonantzintla/MC-ID/commit/ff0b725))
- Add workflow_dispatch inputs for force release and release type ([6f39b5e](https://github.com/Tonantzintla/MC-ID/commit/6f39b5e))
- Enhance workflow_dispatch to support forced releases with versioning ([8e31670](https://github.com/Tonantzintla/MC-ID/commit/8e31670))
- Add shadcn-svelte component "empty" ([89f7642](https://github.com/Tonantzintla/MC-ID/commit/89f7642))
- Add shadcn-svelte component "item" ([d26add7](https://github.com/Tonantzintla/MC-ID/commit/d26add7))
- Add shadcn-svelte component "popover" ([be545a5](https://github.com/Tonantzintla/MC-ID/commit/be545a5))
- Add shadcn-svelte component "scroll-area" ([022236f](https://github.com/Tonantzintla/MC-ID/commit/022236f))
- Add shadcn-svelte component "seperator" ([96a7606](https://github.com/Tonantzintla/MC-ID/commit/96a7606))
- Add shadcn-svelte component "spinner" ([ba4f81f](https://github.com/Tonantzintla/MC-ID/commit/ba4f81f))
- Add is-hover hook ([30d3bf1](https://github.com/Tonantzintla/MC-ID/commit/30d3bf1))
- Add CODEOWNERS file for repository maintainers ([343ad41](https://github.com/Tonantzintla/MC-ID/commit/343ad41))
- Simplify secret reset by removing hashing ([3610a2f](https://github.com/Tonantzintla/MC-ID/commit/3610a2f))
- Enhance scopes with consent descriptions for clarity ([34b43ea](https://github.com/Tonantzintla/MC-ID/commit/34b43ea))
- Implement OAuth consent flow with additional user info retrieval ([141acc4](https://github.com/Tonantzintla/MC-ID/commit/141acc4))
- Add database cleanup cron job for expired entries ([aee8f7c](https://github.com/Tonantzintla/MC-ID/commit/aee8f7c))
- Enhance protected route handling for authenticated users ([c6566f1](https://github.com/Tonantzintla/MC-ID/commit/c6566f1))
- Remove MC-ID login functionality and related components ([4d35332](https://github.com/Tonantzintla/MC-ID/commit/4d35332))
- Remove MC login form validation from the login route ([e3d011e](https://github.com/Tonantzintla/MC-ID/commit/e3d011e))
- Add shadcn-svelte input-otp component ([68f0bc3](https://github.com/Tonantzintla/MC-ID/commit/68f0bc3))
- Implement Minecraft account linking and verification flow ([011dbfb](https://github.com/Tonantzintla/MC-ID/commit/011dbfb))
- Remove username validation schema and related code ([dbb0a32](https://github.com/Tonantzintla/MC-ID/commit/dbb0a32))
- Update environment variables for MCID API integration ([8bddc55](https://github.com/Tonantzintla/MC-ID/commit/8bddc55))
- Integrate primary Minecraft account handling across components and routes ([f46940e](https://github.com/Tonantzintla/MC-ID/commit/f46940e))
- Add default UUID generation for primary key in minecraft_account table ([51924d8](https://github.com/Tonantzintla/MC-ID/commit/51924d8))
- Simplify user update payload by removing redundant fields ([6cfb7b5](https://github.com/Tonantzintla/MC-ID/commit/6cfb7b5))
- Streamline API key creation process by removing unnecessary request headers and adding loading spinner ([9a8e518](https://github.com/Tonantzintla/MC-ID/commit/9a8e518))
- Migrate email templates from React to Svelte ([cca8e99](https://github.com/Tonantzintla/MC-ID/commit/cca8e99))
- Update configuration files ([e7caf0f](https://github.com/Tonantzintla/MC-ID/commit/e7caf0f))
- Add Svelte SEO integration for improved metadata handling ([72c907e](https://github.com/Tonantzintla/MC-ID/commit/72c907e))
- Add dynamic runes mode handling and warning suppression in Svelte config ([4bc95ff](https://github.com/Tonantzintla/MC-ID/commit/4bc95ff))
- Redesign home page ([7987603](https://github.com/Tonantzintla/MC-ID/commit/7987603))
- Migrate to jsrepo 3 ([132a186](https://github.com/Tonantzintla/MC-ID/commit/132a186))
- Enhance dashboard with quick links and user greeting ([1e45dc3](https://github.com/Tonantzintla/MC-ID/commit/1e45dc3))
- Migrate better-svelte-email to v1 ([60b90f9](https://github.com/Tonantzintla/MC-ID/commit/60b90f9))
- Update deps ([c373d30](https://github.com/Tonantzintla/MC-ID/commit/c373d30))
- Update better-auth ([a31c46e](https://github.com/Tonantzintla/MC-ID/commit/a31c46e))
- Add field error handling to app form and improve URI validation ([89d533e](https://github.com/Tonantzintla/MC-ID/commit/89d533e))
- Change form validation method from 'oninput' to 'onblur' across multiple forms ([f681fa0](https://github.com/Tonantzintla/MC-ID/commit/f681fa0))
- Update button labels for clarity in app form ([9d99fc1](https://github.com/Tonantzintla/MC-ID/commit/9d99fc1))
- Update API reference URL and adjust trusted origins in config ([d97f458](https://github.com/Tonantzintla/MC-ID/commit/d97f458))
- Add autocomplete attributes for password fields in security settings ([fd36769](https://github.com/Tonantzintla/MC-ID/commit/fd36769))
- Switch to minimal import for better-auth in auth configuration ([d9143a6](https://github.com/Tonantzintla/MC-ID/commit/d9143a6))
- Implement code request and verification system with new database schema and API endpoints. ([6885bfc](https://github.com/Tonantzintla/MC-ID/commit/6885bfc))
- Introduce automated release workflow with conventional commits and separate CI build. ([2bbe461](https://github.com/Tonantzintla/MC-ID/commit/2bbe461))
- Update GitHub Actions versions for checkout, setup-node, setup-java, setup-gradle, and pnpm setup. ([28c4627](https://github.com/Tonantzintla/MC-ID/commit/28c4627))

### 🩹 Fixes

- Update package name and license in package.json ([cae217d](https://github.com/Tonantzintla/MC-ID/commit/cae217d))
- Update GitHub link in header menu items ([1335f61](https://github.com/Tonantzintla/MC-ID/commit/1335f61))
- Update zod version to 4.0.10 in package.json and pnpm-lock.yaml; remove pnpm config from website package.json ([e8578a7](https://github.com/Tonantzintla/MC-ID/commit/e8578a7))
- Standardize pnpm configuration in package.json files; update zod version to 4.0.10 ([3afd7a5](https://github.com/Tonantzintla/MC-ID/commit/3afd7a5))
- Update .env.example to include Discord client credentials and address header ([8949626](https://github.com/Tonantzintla/MC-ID/commit/8949626))
- Update README files to remove references to the deprecated MC-ID API ([45932a1](https://github.com/Tonantzintla/MC-ID/commit/45932a1))
- Update authentication configuration to use hardcoded client credentials for now ([69ecd53](https://github.com/Tonantzintla/MC-ID/commit/69ecd53))
- Remove unused trusted provider "mc-id" from account linking ([b9beb3e](https://github.com/Tonantzintla/MC-ID/commit/b9beb3e))
- Forward the ORPC errors as they are being caught in the try catch, resulting in 500 errors when they're not ([6de4a49](https://github.com/Tonantzintla/MC-ID/commit/6de4a49))
- Refactor DATABASE_URL handling for improved clarity and consistency ([96cac63](https://github.com/Tonantzintla/MC-ID/commit/96cac63))
- Update ESLint configuration to use defineConfig as ts.config is deprecated ([44e4956](https://github.com/Tonantzintla/MC-ID/commit/44e4956))
- Enhance DATABASE_URL validation to account for building environment ([49edcbe](https://github.com/Tonantzintla/MC-ID/commit/49edcbe))
- Remove building environment check for DATABASE_URL in configuration ([e28c169](https://github.com/Tonantzintla/MC-ID/commit/e28c169))
- Downgrade sveltekit for now #14590 ([#14590](https://github.com/Tonantzintla/MC-ID/issues/14590))
- Keep react and react-dom version in sync ([17f82b4](https://github.com/Tonantzintla/MC-ID/commit/17f82b4))
- Remove maxlength attribute from email input in login form ([456f6ba](https://github.com/Tonantzintla/MC-ID/commit/456f6ba))
- Update API key header in ApiHandler and remove unused appName field from PlayerCodeResponse ([346f1a1](https://github.com/Tonantzintla/MC-ID/commit/346f1a1))
- Simplify verification code message and remove appName reference ([827c21e](https://github.com/Tonantzintla/MC-ID/commit/827c21e))
- Adjust API endpoint resolution to ensure correct path structure ([b559739](https://github.com/Tonantzintla/MC-ID/commit/b559739))
- Update versioning to use environment variable for CI builds ([e29312b](https://github.com/Tonantzintla/MC-ID/commit/e29312b))
- Refactor GitHub Actions workflow for versioning and release management ([f896af8](https://github.com/Tonantzintla/MC-ID/commit/f896af8))
- Update README to clarify API endpoint and key configuration ([5853d56](https://github.com/Tonantzintla/MC-ID/commit/5853d56))
- Improve tag detection and commit logging for versioning ([88029fd](https://github.com/Tonantzintla/MC-ID/commit/88029fd))
- Update build command and API reference in CONTRIBUTING.md ([af085ff](https://github.com/Tonantzintla/MC-ID/commit/af085ff))
- Enhance release notes generation to handle missing tags ([ebe5835](https://github.com/Tonantzintla/MC-ID/commit/ebe5835))
- Reorder steps in CONTRIBUTING.md for clarity ([cfa0e0b](https://github.com/Tonantzintla/MC-ID/commit/cfa0e0b))
- Add tagging step to create and push version tags during release ([012dae4](https://github.com/Tonantzintla/MC-ID/commit/012dae4))
- Test release workflow with explicit tag creation ([ba47ea5](https://github.com/Tonantzintla/MC-ID/commit/ba47ea5))
- Add permissions section to build-plugin.yml for content write access ([ca96526](https://github.com/Tonantzintla/MC-ID/commit/ca96526))
- Ensure PAT_TOKEN is used for checkout and release steps in build-plugin.yml ([5f8b66e](https://github.com/Tonantzintla/MC-ID/commit/5f8b66e))
- Add tagging step to release workflow for versioning ([b1fe20b](https://github.com/Tonantzintla/MC-ID/commit/b1fe20b))
- Replace PAT_TOKEN with GITHUB_TOKEN for authentication in build-plugin.yml ([55239ea](https://github.com/Tonantzintla/MC-ID/commit/55239ea))
- Remove testing password reset button from profile settings ([17d1596](https://github.com/Tonantzintla/MC-ID/commit/17d1596))
- Node-cron must be a regular dependency ([2edc9b4](https://github.com/Tonantzintla/MC-ID/commit/2edc9b4))
- Ensure process exits cleanly on SvelteKit shutdown ([8c226d7](https://github.com/Tonantzintla/MC-ID/commit/8c226d7))
- Eslint errors ([22cc6b4](https://github.com/Tonantzintla/MC-ID/commit/22cc6b4))
- Sveltekit-checke errors ([ec801ff](https://github.com/Tonantzintla/MC-ID/commit/ec801ff))
- Update base and production node version to 24-alpine ([1e040b4](https://github.com/Tonantzintla/MC-ID/commit/1e040b4))
- Update email rendering ([86dc7be](https://github.com/Tonantzintla/MC-ID/commit/86dc7be))

### 💅 Refactors

- **api:** Migrate the api to use orpc ([cf17331](https://github.com/Tonantzintla/MC-ID/commit/cf17331))

### 📖 Documentation

- Update README files to correct project links and descriptions ([7460900](https://github.com/Tonantzintla/MC-ID/commit/7460900))
- Update README files to include additional project links and descriptions ([3953f67](https://github.com/Tonantzintla/MC-ID/commit/3953f67))
- Format ([e17a609](https://github.com/Tonantzintla/MC-ID/commit/e17a609))
- Adjust image alignment in README.md ([f721ce2](https://github.com/Tonantzintla/MC-ID/commit/f721ce2))

### 🏡 Chore

- Update README and add LICENSE file ([6758bf2](https://github.com/Tonantzintla/MC-ID/commit/6758bf2))
- Add package.json and pnpm-workspace.yaml files ([0386143](https://github.com/Tonantzintla/MC-ID/commit/0386143))
- Add .gitignore file to exclude IDE and build artifacts ([1399af9](https://github.com/Tonantzintla/MC-ID/commit/1399af9))
- Remove pnpm-lock.yaml, yarn.lock, and package-lock.json from .gitignore ([7cabc43](https://github.com/Tonantzintla/MC-ID/commit/7cabc43))
- Delete the api project as it has been migrated to the website itself ([78f60c5](https://github.com/Tonantzintla/MC-ID/commit/78f60c5))
- Update deps ([cca25f5](https://github.com/Tonantzintla/MC-ID/commit/cca25f5))
- Prettier format ([34db5a1](https://github.com/Tonantzintla/MC-ID/commit/34db5a1))
- Update deps ([7b19451](https://github.com/Tonantzintla/MC-ID/commit/7b19451))
- Update shadcn-svelte components ([bbf82f7](https://github.com/Tonantzintla/MC-ID/commit/bbf82f7))
- Update deps ([2f8744c](https://github.com/Tonantzintla/MC-ID/commit/2f8744c))
- Update pnpm-lock file ([f0bacc3](https://github.com/Tonantzintla/MC-ID/commit/f0bacc3))
- Prettier format ([01d5919](https://github.com/Tonantzintla/MC-ID/commit/01d5919))
- **deps-dev:** Bump sveltekit-superforms from 2.27.1 to 2.27.4 ([f5fcc58](https://github.com/Tonantzintla/MC-ID/commit/f5fcc58))
- **deps-dev:** Bump sveltekit-superforms in /website ([5387c99](https://github.com/Tonantzintla/MC-ID/commit/5387c99))
- Prettier format ([19f1fdf](https://github.com/Tonantzintla/MC-ID/commit/19f1fdf))
- Update shadcn-svelte components ([d9770a2](https://github.com/Tonantzintla/MC-ID/commit/d9770a2))
- Prettier format ([73e6546](https://github.com/Tonantzintla/MC-ID/commit/73e6546))
- Update deps ([72b583f](https://github.com/Tonantzintla/MC-ID/commit/72b583f))
- Update shadcn-svelte-extras components ([37b902b](https://github.com/Tonantzintla/MC-ID/commit/37b902b))
- Update deps ([4c1e55b](https://github.com/Tonantzintla/MC-ID/commit/4c1e55b))
- Update pnpm to 10.23.0 and remove explicit version from CI workflow. ([bb1661a](https://github.com/Tonantzintla/MC-ID/commit/bb1661a))
- Add CHANGELOG.md and remove explicit GITHUB_TOKEN from release workflow. ([ac27825](https://github.com/Tonantzintla/MC-ID/commit/ac27825))

### 🎨 Styles

- Remove quotes from package names in pnpm-workspace.yaml ([97b437e](https://github.com/Tonantzintla/MC-ID/commit/97b437e))

### ❤️ Contributors

- DarthGigi ([@DarthGigi](https://github.com/DarthGigi))

