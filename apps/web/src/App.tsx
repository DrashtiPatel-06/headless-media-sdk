import { useEffect, useState, type FormEvent } from 'react'
import { MediaProvider, useMediaClient, usePhotoSearch, useVideoSearch } from '@owl-media/media-react'
import { useLightbox, useMediaGrid, useReel, useSearchField } from '@owl-media/media-ui-react'
import type { PexelsPhoto, PexelsVideo } from '@owl-media/media-react'
import './gallery.css'

type MediaTab = 'photos' | 'videos'
type Selection = { kind: 'photo'; item: PexelsPhoto } | { kind: 'video'; item: PexelsVideo }

function KeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState('')
  const [visible, setVisible] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (key.trim()) onSave(key.trim())
  }
  return (
    <main className="key-screen">
      <a className="wordmark" href="#top" aria-label="Frame home"><span className="brand-mark">F</span> frame<span className="wordmark-dot">.</span></a>
      <section className="key-panel">
        <p className="eyebrow">YOUR CREATIVE INDEX</p>
        <h1>A world of imagery,<br /><em>in one place.</em></h1>
        <p className="intro-copy">Search a living library of photography and motion, curated by the people who make it.</p>
        <form className="key-form" onSubmit={submit}>
          <label htmlFor="pexels-key">Pexels API key</label>
          <div className="key-input-row">
            <input id="pexels-key" value={key} onChange={(event) => setKey(event.target.value)} type={visible ? 'text' : 'password'} placeholder="Paste your API key" autoComplete="off" required />
            <button type="button" className="reveal-key" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide API key' : 'Show API key'}>{visible ? 'Hide' : 'Show'}</button>
          </div>
          <button className="primary-button" type="submit">Open the library <span aria-hidden="true">↗</span></button>
        </form>
        <p className="key-note">The key is held in this browser session and sent to Pexels. For a deployed public app, use a protected proxy.</p>
        <a className="quiet-link" href="https://www.pexels.com/api/" target="_blank" rel="noreferrer">Get a free Pexels API key <span aria-hidden="true">↗</span></a>
      </section>
      <div className="key-art" aria-hidden="true"><span>01</span><span>VISUAL<br />RESEARCH</span><span className="art-cross">+</span></div>
    </main>
  )
}

function MediaWorkspace({ onSignOut }: { onSignOut: () => void }) {
  const client = useMediaClient()
  const [tab, setTab] = useState<MediaTab>('photos')
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [activityCount, setActivityCount] = useState(0)
  const [lastActivity, setLastActivity] = useState('No activity yet')
  const photos = usePhotoSearch(submittedQuery, tab === 'photos')
  const videos = useVideoSearch(submittedQuery, tab === 'videos')
  const activeItems = tab === 'photos' ? photos.items : videos.items
  const activeLoading = tab === 'photos' ? photos.loading : videos.loading
  const activeError = tab === 'photos' ? photos.error : videos.error
  const activeHasMore = tab === 'photos' ? photos.hasMore : videos.hasMore
  const activeLoadingMore = tab === 'photos' ? photos.loadingMore : videos.loadingMore
  const activeLoadMore = tab === 'photos' ? photos.loadMore : videos.loadMore
  const activeRetry = tab === 'photos' ? photos.retry : videos.retry

  useEffect(() => client.onEvent((event) => {
    setActivityCount((count) => count + 1)
    setLastActivity(`${event.type} · ${event.mediaType} #${event.mediaId}`)
  }), [client])

  const onSelectPhoto = (item: PexelsPhoto) => {
    client.trackView('photo', item.id)
    setSelection({ kind: 'photo', item })
  }
  const onSelectVideo = (item: PexelsVideo) => {
    client.trackView('video', item.id)
    setSelection({ kind: 'video', item })
  }
  const photoGrid = useMediaGrid({ items: photos.items, getKey: (item) => item.id, onSelect: onSelectPhoto, label: 'Photo results' })
  const videoGrid = useMediaGrid({ items: videos.items, getKey: (item) => item.id, onSelect: onSelectVideo, label: 'Video results' })
  const search = useSearchField({ value: query, onChange: setQuery, onSubmit: setSubmittedQuery, label: 'Search Pexels media' })
  const selectedVideoIndex = selection?.kind === 'video' ? videos.items.findIndex((video) => video.id === selection.item.id) : -1
  const selectRelativeVideo = (offset: number) => {
    if (videos.items.length === 0) return
    const nextIndex = (selectedVideoIndex + offset + videos.items.length) % videos.items.length
    onSelectVideo(videos.items[nextIndex])
  }
  const reel = useReel({ onNext: () => selectRelativeVideo(1), onPrevious: () => selectRelativeVideo(-1) })
  const lightbox = useLightbox({ label: selection?.kind === 'video' ? 'Video reel' : 'Photo viewer', onClose: () => setSelection(null) })

  return (
    <main className="app-shell" id="top">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Frame home"><span className="brand-mark">F</span> frame<span className="wordmark-dot">.</span></a>
        <div className="topbar-right"><span className="live-indicator"><i /> PEXELS LIBRARY</span><button className="text-button" type="button" onClick={onSignOut}>Change key</button></div>
      </header>
      <section className="intro-row">
        <div><p className="eyebrow">MONDAY, SEPTEMBER 28, 2026 <span className="eyebrow-divider">/</span> ISSUE 001</p><h1>Find your <em>frame.</em></h1></div>
        <p className="intro-caption">An open library for visual thinkers.<br />Made to wander, built to find.</p>
      </section>
      <section className="search-section" aria-label="Media search">
        <form className="search-form" {...search.getFormProps()}>
          <span className="search-glyph" aria-hidden="true">⌕</span>
          <input {...search.getInputProps()} placeholder="Try ‘quiet mornings’ or ‘coastal light’" />
          <button className="search-submit" type="submit" aria-label="Search">↗</button>
        </form>
        <div className="search-bottom">
          <div className="tabs" role="tablist" aria-label="Media type">
            <button className={tab === 'photos' ? 'tab active' : 'tab'} type="button" role="tab" aria-selected={tab === 'photos'} onClick={() => setTab('photos')}>Photography <span>{photos.items.length}</span></button>
            <button className={tab === 'videos' ? 'tab active' : 'tab'} type="button" role="tab" aria-selected={tab === 'videos'} onClick={() => setTab('videos')}>Motion <span>{videos.items.length}</span></button>
          </div>
          <p className="result-caption">{submittedQuery ? <>RESULTS FOR <strong>“{submittedQuery}”</strong></> : 'A DAILY EDIT FROM THE COMMUNITY'}</p>
        </div>
      </section>
      <section className="gallery-section" aria-label={tab === 'photos' ? 'Photo gallery' : 'Video gallery'}>
        <div className="gallery-heading"><h2>{tab === 'photos' ? 'Photography' : 'Moving images'}<span className="heading-period">.</span></h2><span className="result-total">{activeItems.length} works</span></div>
        {activeLoading && <div className="state-message"><span className="loader" />Gathering the good stuff…</div>}
        {activeError && <div className="state-message error-message"><strong>Couldn’t load this collection.</strong><span>{activeError.message}</span><button className="text-button" onClick={activeRetry} type="button">Try again</button></div>}
        {!activeLoading && !activeError && activeItems.length === 0 && <div className="state-message">No results this time. Try a different search.</div>}
        {!activeLoading && !activeError && activeItems.length > 0 && tab === 'photos' && (
          <div className="media-grid" {...photoGrid.getGridProps()}>
            {photos.items.map((photo, index) => <article className={`media-tile tile-${index % 6}`} {...photoGrid.getItemProps(photo)} key={photo.id}>
              <button className="media-open" {...photoGrid.getButtonProps(photo)} aria-label={`View photo by ${photo.photographer}`}>
                <img src={photo.src.large} alt={photo.alt || `Photo by ${photo.photographer}`} loading={index < 6 ? 'eager' : 'lazy'} />
                <span className="tile-overlay"><span>{photo.photographer}</span><span className="tile-arrow" aria-hidden="true">↗</span></span>
              </button><span className="tile-index">{String(index + 1).padStart(2, '0')}</span>
            </article>)}
          </div>
        )}
        {!activeLoading && !activeError && activeItems.length > 0 && tab === 'videos' && (
          <div className="media-grid video-grid" {...videoGrid.getGridProps()}>
            {videos.items.map((video, index) => <article className={`media-tile video-tile tile-${index % 6}`} {...videoGrid.getItemProps(video)} key={video.id}>
              <button className="media-open" {...videoGrid.getButtonProps(video)} aria-label={`Play video by ${video.user.name}`}>
                <img src={video.image} alt="" loading={index < 6 ? 'eager' : 'lazy'} /><span className="play-disc" aria-hidden="true">▶</span>
                <span className="tile-overlay"><span>{video.user.name} <small>· {video.duration}s</small></span><span className="tile-arrow" aria-hidden="true">↗</span></span>
              </button><span className="tile-index">{String(index + 1).padStart(2, '0')}</span>
            </article>)}
          </div>
        )}
        {activeHasMore && !activeLoading && <div className="load-more-row"><button className="load-more" type="button" onClick={() => void activeLoadMore()} disabled={activeLoadingMore}>{activeLoadingMore ? 'Loading…' : 'Load more'} <span aria-hidden="true">↓</span></button></div>}
      </section>
      <footer className="app-footer"><span>IMAGES THAT MOVE YOU.</span><span>POWERED BY PEXELS <i>×</i> FRAME</span><span className="activity-indicator" title={lastActivity}>{activityCount} ACTIVITY {activityCount === 1 ? 'EVENT' : 'EVENTS'}</span></footer>
      {selection && <div className="viewer-backdrop" {...lightbox.getBackdropProps()}>
        <section className={`viewer ${selection.kind === 'video' ? 'reel-viewer' : ''}`} {...lightbox.getDialogProps()} onClick={(event) => event.stopPropagation()}>
          <button className="viewer-close" {...lightbox.getCloseButtonProps()}>×</button>
          {selection.kind === 'photo' ? <>
            <img className="viewer-photo" src={selection.item.src.large2x} alt={selection.item.alt || `Photo by ${selection.item.photographer}`} />
            <div className="viewer-meta"><div><span className="eyebrow">PHOTOGRAPHER</span><a href={selection.item.photographer_url} target="_blank" rel="noreferrer">{selection.item.photographer}</a></div><a className="viewer-download" href={selection.item.src.original} target="_blank" rel="noreferrer" onClick={() => client.trackDownload('photo', selection.item.id)}>Download original ↗</a></div>
          </> : <div className="reel-stage" {...reel.getReelProps()}>
            <video key={selection.item.id} src={selection.item.video_files.find((file) => file.quality === 'hd' && file.file_type === 'video/mp4')?.link ?? selection.item.video_files[0]?.link} poster={selection.item.image} autoPlay loop playsInline muted={reel.muted} controls />
            <div className="reel-caption"><span>{selection.item.user.name}</span><span>{selection.item.duration}s · PEXELS</span></div>
            <div className="reel-controls"><button {...reel.getPreviousButtonProps()}>↑</button><button {...reel.getNextButtonProps()}>↓</button><button type="button" aria-label={reel.muted ? 'Unmute video' : 'Mute video'} onClick={() => reel.setMuted(!reel.muted)}>{reel.muted ? 'SOUND OFF' : 'SOUND ON'}</button><a href={selection.item.video_files[0]?.link} target="_blank" rel="noreferrer" onClick={() => client.trackDownload('video', selection.item.id)}>DOWNLOAD ↗</a></div>
          </div>}
        </section>
      </div>}
    </main>
  )
}

function App() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_PEXELS_API_KEY ?? '')
  if (!apiKey) return <KeySetup onSave={setApiKey} />
  return <MediaProvider options={{ apiKey }}><MediaWorkspace onSignOut={() => setApiKey('')} /></MediaProvider>
}

export default App
