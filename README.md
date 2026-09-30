# Frame Media SDK

A web-first monorepo implementing a framework-independent Pexels client, React and React Native adapters, independent headless UI helper packages, and a React demo.

## Run the app

1. Install the workspace dependencies with `npm install`.
2. Run `npm run dev` and open the Vite URL shown in the terminal.
3. Enter a Pexels API key in the app, or copy `.env.example` to `apps/web/.env.local` and set `VITE_PEXELS_API_KEY`.

The browser calls Pexels directly. A Vite environment variable is bundled into client code and is **not secret**. A key entered in the demo is also visible to the browser session. This is a take-home/demo setup; a public production service should call Pexels through a server-side proxy with a server-held key.

## Workspace map

```text
app
├── media-react
│   └── media-core
└── media-ui-react

media-native
└── media-core

media-ui-native (independent)
```

`media-core` owns the Pexels API client, shared types, errors, cache, and local activity events. `media-react` and `media-native` adapt that core to platform hooks/providers. The UI packages are independent: they accept consumer data/callbacks and provide headless prop-getters without SDK imports or mandatory styling. The web app is the composition layer joining `media-react` and `media-ui-react`. The native packages are source-level libraries; this repo does not include a mobile app or device runtime.

## Implemented features

- Photo search and curated photos; video search and popular videos.
- Pagination, individual photo/video fetch methods, typed API errors, and in-memory cache/request deduplication.
- `view` and `download` events with a default console listener and app subscription.
- Photo results grid and lightbox; video results grid and vertical reel viewer.
- Headless React and React Native grid, lightbox, and reel-swiper helpers with accessible prop-getters and no bundled styles.
- `skills/wiring-data/SKILL.md` and `skills/using-components/SKILL.md`.

## Documentation

- [SDK guide](docs/sdk.md) · deployed at [/docs/sdk](https://headless-media-sdk-eight.vercel.app/docs/sdk)
- [Component guide](docs/components.md) · deployed at [/docs/components](https://headless-media-sdk-eight.vercel.app/docs/components)
- [Data wiring skill](skills/wiring-data/SKILL.md)
- [Component usage skill](skills/using-components/SKILL.md)

The documentation routes are rendered by the existing Vite/React app, so the demo and both guides share one Vercel deployment. `vercel.json` rewrites direct documentation requests to the app shell; `main.tsx` selects the matching page by pathname.

## Checks

- `npm run build` runs TypeScript and the Vite production build for the web app.
- `npm run lint` runs ESLint for the web app.
- There is no test script configured in this repository.
- Native packages require the consumer's React Native installation and are not compiled by the web build.
- `npm audit` checks the lockfile dependency tree.

## AI assistance and skill testing

AI coding tools, including GitHub Copilot, assisted with implementation, scaffolding, refactoring, debugging, documentation, and supporting code. The human author reviewed package boundaries, dependency direction, API/configuration behavior, and the production build. The repository's `SKILL.md` files are practical source-aligned instructions; they have not been represented as tested in separate Claude or Cursor runtimes.

## Scope notes

- The browser-only API-key flow is suitable for a demo, not a secure production credential boundary.
- Native wrappers and native headless hooks are provided, but no React Native app, native visual styling, or native-device test is included.
- Vercel deployment settings are represented in `vercel.json`; the Vercel project should use the repository root as its root directory and deploy after the latest commit is pushed.
- Activity is logged locally; no analytics backend is included.

## Submission Links

GitHub Repository: [headless-media-sdk](https://github.com/DrashtiPatel-06/headless-media-sdk)

Live Demo: [https://headless-media-sdk-eight.vercel.app/](https://headless-media-sdk-eight.vercel.app/)

SDK Documentation: [https://headless-media-sdk-eight.vercel.app/docs/sdk](https://headless-media-sdk-eight.vercel.app/docs/sdk)

Component Documentation: [https://headless-media-sdk-eight.vercel.app/docs/components](https://headless-media-sdk-eight.vercel.app/docs/components)