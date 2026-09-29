import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createMediaClient,
  type MediaClient,
  type MediaClientOptions,
  type PexelsPhoto,
  type PexelsVideo,
} from '@owl-media/media-core'

const MediaContext = createContext<MediaClient | null>(null)

export interface MediaProviderProps {
  options: MediaClientOptions
  children: ReactNode
}

export function MediaProvider({ options, children }: MediaProviderProps) {
  const [client] = useState(() => createMediaClient(options))
  return createElement(MediaContext.Provider, { value: client }, children)
}

export function useMediaClient(): MediaClient {
  const client = useContext(MediaContext)
  if (!client) throw new Error('useMediaClient must be used inside MediaProvider.')
  return client
}

export interface SearchState<T> {
  items: T[]
  loading: boolean
  loadingMore: boolean
  error: Error | null
  hasMore: boolean
  retry: () => void
  loadMore: () => Promise<void>
}

function usePagedSearch<T>(query: string, kind: 'photo' | 'video', enabled: boolean): SearchState<T> {
  const client = useMediaClient()
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const searchIdentity = `${kind}\u0000${query}\u0000${refreshKey}\u0000${enabled}`
  const searchIdentityRef = useRef(searchIdentity)
  const resultsIdentityRef = useRef(searchIdentity)
  const loadingMoreIdentityRef = useRef<string | null>(null)
  searchIdentityRef.current = searchIdentity

  useEffect(() => {
    let active = true
    resultsIdentityRef.current = searchIdentity
    loadingMoreIdentityRef.current = null
    if (!enabled) {
      setLoading(false)
      setLoadingMore(false)
      return () => { active = false }
    }
    setLoading(true)
    setLoadingMore(false)
    setError(null)
    setPage(1)
    const request = kind === 'photo'
      ? (query ? client.searchPhotos(query) : client.curatedPhotos())
      : (query ? client.searchVideos(query) : client.popularVideos())

    request.then((response) => {
      if (!active) return
      const results = (kind === 'photo' ? response.photos : response.videos) ?? []
      setItems(results as T[])
      setHasMore(Boolean(response.next_page))
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason : new Error('Media request failed.'))
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [client, kind, query, refreshKey, enabled])

  async function loadMore(): Promise<void> {
    if (!enabled || loading || !hasMore || loadingMoreIdentityRef.current === searchIdentity || resultsIdentityRef.current !== searchIdentity) return
    const nextPage = page + 1
    loadingMoreIdentityRef.current = searchIdentity
    setLoadingMore(true)
    setError(null)
    try {
      const response = kind === 'photo'
        ? (query ? await client.searchPhotos(query, { page: nextPage }) : await client.curatedPhotos({ page: nextPage }))
        : (query ? await client.searchVideos(query, { page: nextPage }) : await client.popularVideos({ page: nextPage }))
      if (searchIdentityRef.current !== searchIdentity) return
      const results = (kind === 'photo' ? response.photos : response.videos) ?? []
      setItems((current: T[]) => [...current, ...(results as T[])])
      setPage(nextPage)
      setHasMore(Boolean(response.next_page))
    } catch (reason) {
      if (searchIdentityRef.current === searchIdentity) {
        setError(reason instanceof Error ? reason : new Error('Media request failed.'))
      }
    } finally {
      if (loadingMoreIdentityRef.current === searchIdentity) {
        loadingMoreIdentityRef.current = null
        setLoadingMore(false)
      }
    }
  }

  return { items, loading, loadingMore, error, hasMore, retry: () => setRefreshKey((key) => key + 1), loadMore }
}

export function usePhotoSearch(query: string, enabled = true): SearchState<PexelsPhoto> {
  return usePagedSearch<PexelsPhoto>(query, 'photo', enabled)
}

export function useVideoSearch(query: string, enabled = true): SearchState<PexelsVideo> {
  return usePagedSearch<PexelsVideo>(query, 'video', enabled)
}

export function useMediaEvents(listener: Parameters<MediaClient['onEvent']>[0]): void {
  const client = useMediaClient()
  useEffect(() => client.onEvent(listener), [client, listener])
}

export type { MediaClient, MediaClientOptions, PexelsPhoto, PexelsVideo }