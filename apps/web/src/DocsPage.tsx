import { useEffect } from 'react'
import './docs.css'

type DocsPageName = 'sdk' | 'components'

function Code({ children }: { children: string }) {
  return <pre><code>{children}</code></pre>
}

function DocsPage({ page }: { page: DocsPageName }) {
  const isSdk = page === 'sdk'

  useEffect(() => {
    document.title = `${isSdk ? 'SDK' : 'Components'} | Frame Media SDK`
  }, [isSdk])

  return (
    <main className="docs-shell">
      <header className="docs-header">
        <a className="docs-brand" href="/">frame<span>.</span></a>
        <nav aria-label="Documentation">
          <a className={isSdk ? 'selected' : ''} href="/docs/sdk">SDK</a>
          <a className={!isSdk ? 'selected' : ''} href="/docs/components">Components</a>
          <a href="/">Live demo <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar" aria-label="On this page">
          <p>{isSdk ? 'SDK REFERENCE' : 'COMPONENT REFERENCE'}</p>
          {isSdk ? <>
            <a href="#overview">Overview</a>
            <a href="#core">media-core</a>
            <a href="#react">media-react</a>
            <a href="#native">media-native</a>
            <a href="#key-security">API key note</a>
          </> : <>
            <a href="#contract">Headless contract</a>
            <a href="#react-grid">React grid</a>
            <a href="#react-lightbox">React lightbox</a>
            <a href="#react-reel">React reel</a>
            <a href="#native-components">React Native</a>
          </>}
        </aside>

        <article className="docs-content">
          <p className="docs-eyebrow">FRAME MEDIA SDK / {isSdk ? 'DATA LAYER' : 'UI LAYER'}</p>
          <h1>{isSdk ? 'SDK reference' : 'Headless components'}</h1>
          <p className="docs-lede">{isSdk
            ? 'A typed Pexels client with thin React and React Native provider/hook adapters.'
            : 'Small interaction and accessibility helpers. The consuming application owns media data, markup, and visual design.'}</p>

          {isSdk ? <>
            <section id="overview">
              <h2>Overview</h2>
              <p><code>media-core</code> is the framework-independent TypeScript client. The platform wrappers depend on core and expose provider/hooks. The web app composes <code>media-react</code> with <code>media-ui-react</code>; UI packages do not import the data SDK.</p>
              <Code>{`apps/web -> media-react -> media-core
        -> media-ui-react
media-native -> media-core
media-ui-native (independent)`}</Code>
            </section>

            <section id="core">
              <h2>media-core</h2>
              <h3>Initialize</h3>
              <p>Create a client with an API key and optional page/cache settings. The constructor rejects an empty key.</p>
              <Code>{`import { createMediaClient } from '@owl-media/media-core'

const client = createMediaClient({
  apiKey: import.meta.env.VITE_PEXELS_API_KEY,
  perPage: 20,
  cacheTtlMs: 30_000,
})`}</Code>

              <h3>Search and pagination</h3>
              <p>Search methods return typed <code>PexelsPage&lt;T&gt;</code> results. Pass the next page number with <code>SearchOptions.page</code>; pages expose <code>next_page</code> and <code>prev_page</code>.</p>
              <Code>{`const photos = await client.searchPhotos('coastal light', {
  page: 1,
  perPage: 20,
  orientation: 'landscape',
})

const nextPhotos = photos.next_page
  ? await client.searchPhotos('coastal light', { page: 2 })
  : undefined

const curated = await client.curatedPhotos({ page: 1 })
const videos = await client.searchVideos('surfing', { page: 1 })
const popular = await client.popularVideos({ page: 1 })`}</Code>
              <p>Supported search options are <code>page</code>, <code>perPage</code>, <code>orientation</code>, <code>size</code>, <code>locale</code>, and <code>color</code>. Defaults are page 1 and 20 results per page.</p>

              <h3>Single-item retrieval</h3>
              <Code>{`const photo = await client.getPhoto(123)
const video = await client.getVideo(456)`}</Code>

              <h3>Responses and errors</h3>
              <p>Photo/video results use <code>PexelsPhoto</code> and <code>PexelsVideo</code>; page results use <code>PexelsPage&lt;T&gt;</code>. HTTP failures reject with <code>MediaApiError</code>, which includes <code>status</code> and <code>endpoint</code>. Network failures remain fetch errors.</p>

              <h3>Cache and request deduplication</h3>
              <p>Successful and in-flight responses are cached by full request URL for 30 seconds by default. Simultaneous matching calls share a promise. The in-memory cache is bounded to 100 least-recently-used entries; expired entries are pruned on requests. Call <code>client.clearCache()</code> to empty it.</p>

              <h3>Activity events</h3>
              <p>The client emits local activity events; it does not send analytics to a server. Construction installs a console listener. Subscribers receive typed <code>view</code> and <code>download</code> events with media kind, id, and timestamp.</p>
              <Code>{`const unsubscribe = client.onEvent((event) => {
  console.log(event.type, event.mediaType, event.mediaId)
})

client.trackView('photo', photo.id)
client.trackDownload('video', video.id)
unsubscribe()`}</Code>
            </section>

            <section id="react">
              <h2>media-react</h2>
              <p><code>MediaProvider</code> creates one client for its mounted lifetime. Put it above consumers and pass the same <code>MediaClientOptions</code> shape used by core.</p>
              <Code>{`import { MediaProvider } from '@owl-media/media-react'

<MediaProvider options={{ apiKey }}>
  <MediaBrowser />
</MediaProvider>`}</Code>
              <p>The provider does not recreate its client when the <code>options</code> object changes; remount the provider to replace the configured client.</p>

              <h3>Search hooks</h3>
              <p><code>usePhotoSearch(query, enabled?)</code> and <code>useVideoSearch(query, enabled?)</code> expose <code>items</code>, <code>loading</code>, <code>loadingMore</code>, <code>error</code>, <code>hasMore</code>, <code>retry()</code>, and <code>loadMore()</code>. The optional enabled flag defaults to true. An empty query loads curated photos or popular videos; a non-empty query searches. Disabled hooks pause fetching and retain their last items.</p>
              <Code>{`function PhotoResults({ query }: { query: string }) {
  const { items, loading, loadingMore, error, hasMore, retry, loadMore } =
    usePhotoSearch(query)

  if (loading) return <p>Loading photos…</p>
  if (error) return <button onClick={retry}>Retry</button>

  return <>
    {items.map((photo) => <img key={photo.id} src={photo.src.medium} alt={photo.alt} />)}
    {hasMore && <button disabled={loadingMore} onClick={() => void loadMore()}>
      {loadingMore ? 'Loading…' : 'Load more'}
    </button>}
  </>
}`}</Code>

              <h3>Client and event access</h3>
              <p><code>useMediaClient()</code> returns the provider client for single-item methods and activity tracking. <code>useMediaEvents(listener)</code> subscribes in an effect and unsubscribes on cleanup.</p>
              <Code>{`const client = useMediaClient()
useMediaEvents((event) => {
  setRecentActivity(event)
})

client.trackView('photo', photo.id)`}</Code>
            </section>

            <section id="native">
              <h2>media-native</h2>
              <p>The source-level React Native adapter exports <code>MediaProvider</code>, <code>useMediaClient</code>, <code>usePhotoSearch</code>, <code>useVideoSearch</code>, and <code>useMediaEvents</code> against the shared core contract. It has no mobile demo or device test in this repository. The consumer supplies React Native presentation and handles platform-specific media playback.</p>
            </section>

            <section id="key-security">
              <h2>API key note</h2>
              <p>The demo sends the key directly from the browser to Pexels. A <code>VITE_</code> environment variable is included in the client bundle, and a key entered in the form is visible to the browser session. Neither is a production secret. Use a server-side proxy for a public service; the take-home intentionally does not add a backend.</p>
            </section>
          </> : <>
            <section id="contract">
              <h2>Headless contract</h2>
              <p>The UI packages do not know about Pexels, <code>media-core</code>, or either data wrapper. They own no fetches, media models, application-level selection state, or mandatory styles. Inputs and callbacks come from the consumer; hooks return interaction props to spread onto consumer-chosen elements.</p>
              <p>These exports are hooks and prop-getters, not prebuilt visual components. Loading, empty, errors, pagination policy, dialog content, and styling remain the app’s responsibility.</p>
            </section>

            <section id="react-grid">
              <h2>React grid</h2>
              <p><code>useMediaGrid&lt;T&gt;({`{ items, getKey, onSelect, label }`})</code> returns the supplied items and getters for list semantics, keyed list items, and an action button that calls <code>onSelect(item)</code>. It has no loading or infinite-scroll behavior.</p>
              <Code>{`const grid = useMediaGrid({
  items,
  getKey: (photo) => photo.id,
  onSelect: setSelectedPhoto,
  label: 'Photo results',
})

<div {...grid.getGridProps()}>
  {items.map((photo) => (
    <article {...grid.getItemProps(photo)} key={photo.id}>
      <button {...grid.getButtonProps(photo)}>
        <img src={photo.src.medium} alt={photo.alt} />
      </button>
    </article>
  ))}
</div>`}</Code>
              <p>Keep the button semantics and supply a useful accessible name (for example, an <code>aria-label</code> on the button). The app combines its data hook’s loading/error/has-more state with the grid. For infinite scrolling, observe a sentinel in the app and call the data hook’s <code>loadMore()</code>.</p>
            </section>

            <section id="react-lightbox">
              <h2>React lightbox</h2>
              <p><code>useLightbox({`{ label, onClose }`})</code> returns dialog props, close-button props, and a backdrop click handler. The caller controls whether selected media is rendered and conditionally mounts the dialog.</p>
              <Code>{`const lightbox = useLightbox({
  label: 'Photo viewer',
  onClose: () => setSelected(null),
})

{selected && <div {...lightbox.getBackdropProps()}>
  <section {...lightbox.getDialogProps()} onClick={(event) => event.stopPropagation()}>
    <button {...lightbox.getCloseButtonProps()}>Close</button>
    <img src={selected.src.large2x} alt={selected.alt} />
  </section>
</div>}`}</Code>
              <p>The helper supplies <code>role="dialog"</code>, <code>aria-modal</code>, an accessible label, and close behavior. It does not implement Escape handling, focus trapping, focus restoration, or focus movement; add and test those in the consuming app if needed.</p>
            </section>

            <section id="react-reel">
              <h2>React reel and swiper</h2>
              <p><code>useReel({`{ onNext, onPrevious }`})</code> supplies reel region props, previous/next callbacks, and local muted state. For vertical touch/keyboard paging and active-item tracking, <code>useReelSwiper({`{ items, getKey, onActiveItemChange, initialIndex? }`})</code> exposes the active item/index, slide props, and previous/next controls. The app renders the video and controls each slide's layout.</p>
              <Code>{`const reel = useReel({ onNext, onPrevious })

<div {...reel.getReelProps()}>
  <video src={activeVideoUrl} muted={reel.muted} controls />
  <button {...reel.getPreviousButtonProps()}>Previous</button>
  <button {...reel.getNextButtonProps()}>Next</button>
  <button onClick={() => reel.setMuted(!reel.muted)}>
    {reel.muted ? 'Unmute' : 'Mute'}
  </button>
</div>`}</Code>
              <Code>{`const swiper = useReelSwiper({
  items: videos,
  getKey: (video) => video.id,
  onActiveItemChange: (video, index) => setActiveVideo(video),
})

<div {...swiper.getReelProps()} tabIndex={0}>
  {swiper.items.map((video, index) => (
    <section {...swiper.getItemProps(video, index)} key={video.id}>
      <video src={video.video_files[0]?.link} controls />
    </section>
  ))}
</div>`}</Code>
              <p>The swiper advances one item for a vertical touch gesture or ArrowUp/ArrowDown and calls <code>onActiveItemChange(item, index)</code>. It does not apply scroll-snap styles or animate slides; the consumer provides vertical layout and transitions.</p>
            </section>

            <section id="native-components">
              <h2>React Native helpers</h2>
              <p><code>media-ui-native</code> exposes <code>useNativeMediaGrid</code>, <code>useNativeLightbox</code>, <code>useNativeMediaItem</code>, <code>useNativeSearch</code>, <code>useNativeReel</code>, and <code>useNativeReelSwiper</code>. They return props for consumer-owned native elements; they do not include a rendered grid, modal content, or video item UI.</p>
              <Code>{`const grid = useNativeMediaGrid({
  items,
  getKey: (item) => item.id,
  getLabel: (item) => item.alt || 'Open photo',
  onSelect: setSelected,
})

<View {...grid.getGridProps()}>
  {grid.items.map((item) => (
    <Pressable key={grid.getKey(item)}
      {...grid.getItemProps(item).getPressableProps()}>
      <Image source={{ uri: item.src.medium }} accessibilityLabel={item.alt} />
    </Pressable>
  ))}
</View>

const lightbox = useNativeLightbox({ open: !!selected, label: 'Photo viewer', onClose })
<Modal {...lightbox.getModalProps()}>
  <View {...lightbox.getDialogProps()}>{/* consumer-rendered media */}</View>
</Modal>`}</Code>
              <Code>{`const swiper = useNativeReelSwiper({
  items: videos,
  itemExtent: viewportHeight,
  getKey: (video) => video.id,
  onActiveItemChange: (video, index) => setActiveVideo(video),
})

<ScrollView {...swiper.getPagerProps()}>
  {swiper.items.map((video) => (
    <View key={swiper.getItemProps(video).key} style={{ height: viewportHeight }}>
      <VideoPlayer video={video} />
    </View>
  ))}
</ScrollView>`}</Code>
              <p>The native grid’s <code>getLabel</code> provides each press target’s accessibility label. The lightbox getter maps visibility, transparency, and Android back-button close behavior to <code>Modal</code>. <code>useNativeReel(onNext, onPrevious)</code> provides navigation callbacks and muted state; <code>useNativeReelSwiper</code> enables vertical <code>ScrollView</code> paging and reports the active item when momentum ends. Set <code>itemExtent</code> to the rendered page height. Use the native platform’s accessibility behavior and styling system.</p>
            </section>
          </>}

          <footer className="docs-footer">
            <a href="https://github.com/DrashtiPatel-06/headless-media-sdk">Source repository <span aria-hidden="true">↗</span></a>
            <span>FRAME MEDIA SDK · SOURCE-ALIGNED REFERENCE</span>
          </footer>
        </article>
      </div>
    </main>
  )
}

export default DocsPage