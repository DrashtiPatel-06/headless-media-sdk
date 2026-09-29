---
name: media-data-wiring
description: Use when configuring media-react, reading Pexels media, handling loading/errors/pagination, or tracking media activity in a React app.
---

# Wire Media Data

## Required boundaries

- The application imports `@owl-media/media-react` for data and `@owl-media/media-ui-react` for interaction helpers.
- Wrappers are the only packages that import `@owl-media/media-core`.
- Never fetch Pexels directly from a component or pass the API key to a UI helper.
- Keep the API key in provider configuration. Explain that a browser key is observable by users.

## Implementation steps

1. Mount one `MediaProvider` near the app root with `{ apiKey }` options.
2. Use `usePhotoSearch(query)` or `useVideoSearch(query)` and render explicit loading, error, empty, and result states.
3. Use `loadMore` only when `hasMore` is true; expose `retry` for recoverable request errors.
4. Get the client with `useMediaClient` only for single-item operations or activity reporting.
5. Subscribe to activity in an effect and return the `onEvent` unsubscribe function from that effect.
6. Call `trackView` when an item is opened and `trackDownload` when a download is requested. Do not emit duplicate events from both a card and its modal.

## Verify before finishing

- The UI never imports `media-core` and no component owns a Pexels request.
- The provider is above every SDK hook consumer.
- Loading, error, empty, pagination, and retry paths are represented.
- The API key is not described as secret in a client-side deployment.
- Event subscriptions clean up on unmount; success/failure state is visible without relying on console output.