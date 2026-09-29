# SDK Guide

## Packages

- `@owl-media/media-core` is framework-independent. It owns the Pexels API client, public types, errors, short-lived in-memory caching, request deduplication, and activity events.
- `@owl-media/media-react` adapts that client to React through a provider and hooks.
- `@owl-media/media-native` provides the same data contract for React Native consumers. It does not include a mobile app.

Only platform wrappers import `media-core`. The app imports its wrapper rather than reaching into the core directly.

## Configure a client

```tsx
import { MediaProvider } from '@owl-media/media-react'

export function App() {
  return (
    <MediaProvider options={{ apiKey: import.meta.env.VITE_PEXELS_API_KEY }}>
      <MediaBrowser />
    </MediaProvider>
  )
}
```

For local development, create `apps/web/.env.local` from `.env.example`. Any `VITE_` variable is public in a browser build. Do not treat it as a secret.

## Search and pagination

```tsx
import { usePhotoSearch } from '@owl-media/media-react'

function PhotoResults({ query }: { query: string }) {
  const { items, loading, error, hasMore, loadMore, retry } = usePhotoSearch(query)
  if (loading) return <p>Loading</p>
  if (error) return <button onClick={retry}>Retry</button>
  return <>
    {items.map((photo) => <img key={photo.id} src={photo.src.medium} alt={photo.alt} />)}
    {hasMore && <button onClick={() => void loadMore()}>Load more</button>}
  </>
}
```

An empty query uses curated photos or popular videos. `useVideoSearch` follows the same contract. Pass `false` as the second hook argument to pause that search until needed; results already loaded by the hook remain available. The core also exposes `searchPhotos`, `curatedPhotos`, `getPhoto`, `searchVideos`, `popularVideos`, and `getVideo` for wrapper implementations or non-React consumers.

## Activity events

The core installs a default console listener. Apps may independently subscribe through the wrapper:

```tsx
import { useEffect } from 'react'
import { useMediaClient } from '@owl-media/media-react'

function ActivityTracker() {
  const client = useMediaClient()
  useEffect(() => client.onEvent((event) => {
    console.log(event.type, event.mediaType, event.mediaId)
  }), [client])
  return null
}
```

Call `client.trackView('photo', id)` when media is opened and `client.trackDownload('video', id)` when the user requests a download. Unsubscribe by calling the function returned by `onEvent`.

## Errors and cache

HTTP failures reject with `MediaApiError`, including the response status and endpoint. The React hooks expose failures as `error` state. Successful requests are cached in memory for 30 seconds by default, with a 100-entry least-recently-used bound; matching in-flight requests share the same promise. Use `clearCache()` to empty the cache.