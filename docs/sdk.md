# SDK Reference

## Overview

`@owl-media/media-core` is a framework-independent TypeScript Pexels client. `@owl-media/media-react` and `@owl-media/media-native` adapt it for their respective React runtimes. The web app composes `media-react` with the separate `media-ui-react` package. Neither UI package imports the data SDK.

```text
apps/web -> media-react -> media-core
        -> media-ui-react
media-native -> media-core
media-ui-native (independent)
```

## media-core

### Initialization and authentication

```ts
import { createMediaClient } from '@owl-media/media-core'

const client = createMediaClient({
  apiKey: import.meta.env.VITE_PEXELS_API_KEY,
  perPage: 20,
  cacheTtlMs: 30_000,
})
```

`apiKey` is required and trimmed; an empty key throws. Requests authenticate by sending the key in Pexels' `Authorization` header. `perPage` defaults to 20 and `cacheTtlMs` to 30 seconds.

### Search, curated results, and pagination

```ts
const photos = await client.searchPhotos('coastal light', {
  page: 1,
  perPage: 20,
  orientation: 'landscape',
})
const curatedPhotos = await client.curatedPhotos({ page: 1 })
const videos = await client.searchVideos('surfing', { page: 1 })
const popularVideos = await client.popularVideos({ page: 1 })
```

`SearchOptions` supports `page`, `perPage`, `orientation` (`landscape`, `portrait`, `square`), `size` (`large`, `medium`, `small`), `locale`, and `color`. Responses are typed `PexelsPage<PexelsPhoto>` or `PexelsPage<PexelsVideo>` and include `next_page`/`prev_page` when supplied by Pexels. Request the next page by passing its page number in the options; the client does not automatically follow `next_page` URLs.

### Single-item retrieval

```ts
const photo = await client.getPhoto(123)
const video = await client.getVideo(456)
```

### Types and errors

The public types include `PexelsPhoto`, `PexelsVideo`, their file/picture types, `PexelsPage<T>`, `SearchOptions`, and `MediaClientOptions`. Non-2xx responses reject with `MediaApiError`, including the HTTP `status` and requested `endpoint`. Network failures remain the platform's fetch errors.

### Cache and request deduplication

Responses are keyed by full request URL and cached in memory for the configured TTL. Matching concurrent requests share the same promise. Expired entries are pruned when another request is made and the cache is capped at 100 least-recently-used entries. Rejected requests are removed. Call `client.clearCache()` to clear all entries. The cache is per client instance and is not persistent.

### Events

The client emits local activity events; it does not send analytics to a server. A default `console.info` listener is installed when a client is created. Register and remove your own listener with `onEvent`:

```ts
const unsubscribe = client.onEvent((event) => {
  console.log(event.type, event.mediaType, event.mediaId, event.timestamp)
})

client.trackView('photo', photo.id)
client.trackDownload('video', video.id)
unsubscribe()
```

Events have `type` (`view` or `download`), `mediaType` (`photo` or `video`), `mediaId`, and a millisecond timestamp. A listener exception is logged and does not stop the other listeners.

## media-react

### Provider and client

`MediaProvider` accepts `{ options: MediaClientOptions, children }` and creates a client for that mounted provider's lifetime. It does not replace the client when `options` changes; remount the provider to change configuration.

```tsx
import { MediaProvider } from '@owl-media/media-react'

<MediaProvider options={{ apiKey }}>
  <MediaBrowser />
</MediaProvider>
```

`useMediaClient()` returns the provider client and throws when called outside a provider.

### Search hooks and state

`usePhotoSearch(query, enabled = true)` and `useVideoSearch(query, enabled = true)` return `items`, `loading`, `loadingMore`, `error`, `hasMore`, `retry()`, and `loadMore()`. Empty query selects curated photos or popular videos; non-empty query calls the corresponding search endpoint. Set `enabled` to false to pause requests until the hook is needed. Disabled hooks retain their previous items. The hooks report loading/errors and page results; the application chooses how and when to render them.

```tsx
const { items, loading, loadingMore, error, hasMore, retry, loadMore } =
  usePhotoSearch(query)

if (loading) return <p>Loading…</p>
if (error) return <button onClick={retry}>Retry</button>

return <>
  {items.map((photo) => <img key={photo.id} src={photo.src.medium} alt={photo.alt} />)}
  {hasMore && <button disabled={loadingMore} onClick={() => void loadMore()}>
    {loadingMore ? 'Loading…' : 'Load more'}
  </button>}
</>
```

### Activity events

`useMediaEvents(listener)` subscribes to the current provider client in an effect and unsubscribes when the listener changes or the consumer unmounts. `useMediaClient()` can also be used to call `trackView`, `trackDownload`, or the core API methods directly.

## media-native

`@owl-media/media-native` exposes the same conceptual data adapter: `MediaProvider`, `useMediaClient`, `usePhotoSearch`, `useVideoSearch`, and `useMediaEvents`. It delegates network access, types, errors, caching, and event dispatch to `media-core`; it contains no separate Pexels client. It is a source-level package in this take-home, with no mobile app or device-level test. Consumers supply React Native presentation and playback behavior.

## Key handling in the demo

The web demo accepts a key in a form or reads `VITE_PEXELS_API_KEY`. A Vite-prefixed value is compiled into the public browser bundle; a form-entered key is also available to the browser session and sent directly to Pexels. This is appropriate for a take-home/demo key, not a secret for a public service. Use a server-side proxy and server-side key for production.