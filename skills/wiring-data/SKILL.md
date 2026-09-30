---
name: media-data-wiring
description: Use when configuring media-react, reading Pexels media, handling loading/errors/pagination, or tracking media activity in a React app.
---

# Wire Media Data

Use this skill when connecting a React app to Pexels data through this repository's SDK.

## Package boundaries

- The app imports `@owl-media/media-react` for data. It may separately import `@owl-media/media-ui-react` for headless interactions.
- `media-react` and `media-native` are the only packages that import `media-core`. UI packages must never import a data wrapper or core.
- Use the SDK client/hooks; do not add a direct `fetch('https://api.pexels.com/...')` inside a component.
- Do not pass an API key into UI hooks or media items.

## Configure the provider

Mount `MediaProvider` above every hook consumer and provide `{ apiKey }` through its `options` prop:

```tsx
import { MediaProvider } from '@owl-media/media-react'

<MediaProvider options={{ apiKey: import.meta.env.VITE_PEXELS_API_KEY }}>
	<MediaBrowser />
</MediaProvider>
```

The provider creates one client for its mounted lifetime. Remount it to replace options. A `VITE_` key is public in a browser build; the demo sends it from the client directly to Pexels. Never describe that key as secret. For a public production service, use a server-side proxy and server-held credential.

## Search and render states

Use `usePhotoSearch(query, enabled?)` or `useVideoSearch(query, enabled?)`. Both return `items`, `loading`, `loadingMore`, `error`, `hasMore`, `retry()`, and `loadMore()`. The `enabled` argument defaults to `true`; pass `false` to pause inactive tabs. An empty query calls curated photos or popular videos.

```tsx
const { items, loading, loadingMore, error, hasMore, retry, loadMore } =
	usePhotoSearch(query)

if (loading) return <LoadingState />
if (error) return <ErrorState error={error} onRetry={retry} />
if (items.length === 0) return <EmptyState />

return <>
	<PhotoGrid items={items} />
	{hasMore && <button disabled={loadingMore} onClick={() => void loadMore()}>
		{loadingMore ? 'Loading…' : 'Load more'}
	</button>}
</>
```

Render loading/error/empty/results as distinct states. Guard the load-more control by `hasMore`; use `loadingMore` to prevent misleading repeated actions. The SDK hook prevents overlapping page calls and ignores stale query results; still keep UI state local to the owning hook.

## Events and single-item methods

Use `useMediaClient()` for client methods and activity tracking. `useMediaEvents(listener)` handles subscription cleanup:

```tsx
const client = useMediaClient()

useMediaEvents((event) => {
	setActivity((current) => [event, ...current].slice(0, 20))
})

function openPhoto(photo: PexelsPhoto) {
	client.trackView('photo', photo.id)
	setSelected(photo)
}

function recordDownload(photo: PexelsPhoto) {
	client.trackDownload('photo', photo.id)
}
```

Events are local only, and client construction also installs a default console listener. Emit view/download at one intentional user action point; do not emit once from the grid and again from the dialog for the same action. Core single-item calls are `getPhoto(id)` and `getVideo(id)`.

## Integration checks

- Confirm the provider is above all data hooks and UI helpers receive only item data/callbacks.
- Confirm the app never imports `media-core` directly and UI modules never import a data package.
- Exercise photo and video search, empty-query defaults, retry, and a second page.
- Confirm event subscriptions clean up and visible UI reports failures without relying on console output.
- Confirm the API-key limitation is stated wherever a browser-provided key is configured.