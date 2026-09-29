# Frame Media SDK

A web-first monorepo take-home implementing a framework-free Pexels client, platform wrappers, independent headless UI packages, and a React app that connects them.

## Run the app

1. Install the workspace dependencies with `npm install`.
2. Run `npm run dev` and open the Vite URL shown in the terminal.
3. Enter a Pexels API key in the app, or copy `.env.example` to `apps/web/.env.local` and set `VITE_PEXELS_API_KEY`.

The browser calls Pexels directly. A Vite environment variable is bundled into client code and is **not secret**. For a public deployment, use a protected proxy or restrict the Pexels key as much as Pexels allows. The in-app key form keeps the key in memory only for the current page session.

## Workspace map

```text
apps/web                 React application; the only place joining data and UI
packages/media-core      Typed Pexels client, cache, errors, event emitter
packages/media-react     React provider, search hooks, activity subscription
packages/media-native    React Native-compatible provider and search hooks
packages/media-ui-react  Independent web prop-getters and interaction hooks
packages/media-ui-native Independent React Native prop-getters
skills/                  Agent skill documents used to review integration
docs/                    SDK and component usage guides
```

Dependency direction is `web -> media-react -> media-core`, plus `web -> media-ui-react`. The native packages are separate siblings. Neither UI package imports the core or a wrapper. The native packages are source-level libraries only; this take-home does not include a mobile app or React Native runtime.

## Implemented features

- Photo search and curated photos; video search and popular videos.
- Pagination, individual photo/video fetch methods, typed API errors, and in-memory cache/request deduplication.
- `view` and `download` events with a default console listener and app subscription.
- Photo results grid and lightbox; video results grid and vertical reel viewer.
- Headless interaction helpers with accessible prop-getters and no bundled styles.
- `skills/wiring-data/SKILL.md` and `skills/using-components/SKILL.md`.

## Documentation

- [SDK guide](docs/sdk.md)
- [Component guide](docs/components.md)
- [Data wiring skill](skills/wiring-data/SKILL.md)
- [Component usage skill](skills/using-components/SKILL.md)

These guides are source Markdown and are not deployed to a documentation host yet. Add a host and deployment credentials to publish the requested docs URLs.

## Checks

- `npm run build` runs TypeScript and the Vite production build for the web app.
- `npm run lint` runs ESLint for the web app.
- Native packages require the consumer's React Native installation and are not compiled by the web build.

## AI assistance and skill testing

The implementation, package scaffolding, styles, and documentation were AI-assisted with GitHub Copilot. The human contribution was providing the requirements and reviewing the resulting architecture/build; no source is represented as exclusively hand-written.

The two skills were written as operational checklists and then applied to review this app's provider/auth/event wiring and its prop-getter usage. The integration was checked with the production build and by inspecting the import boundaries. They have not been run through a separately installed Claude/Cursor agent runtime; they are plain `SKILL.md` files ready to be added to one.

## Scope notes

- The browser-only API-key flow is suitable for local evaluation, not a secure production credential boundary.
- Native wrappers and native headless hooks are provided, but no React Native app, native visual styling, or native-device test is included.
- No docs hosting or app deployment was configured in this workspace, so live submission URLs still need to be created.
- Activity is logged locally; no analytics backend is included.