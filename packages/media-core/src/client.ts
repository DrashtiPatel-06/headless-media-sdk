import {
  MediaApiError,
  type MediaActivityEvent,
  type MediaEventListener,
  type MediaKind,
  type MediaClientOptions,
  type PexelsPage,
  type PexelsPhoto,
  type PexelsVideo,
  type SearchOptions,
} from './types'

interface CacheEntry {
  expiresAt: number
  promise: Promise<unknown>
}

const MAX_CACHE_ENTRIES = 100

function buildQuery(values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) query.set(key, String(value))
  }
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export class MediaClient {
  readonly #apiKey: string
  readonly #perPage: number
  readonly #cacheTtlMs: number
  readonly #cache = new Map<string, CacheEntry>()
  readonly #listeners = new Set<MediaEventListener>()

  constructor(options: MediaClientOptions) {
    if (!options.apiKey.trim()) throw new Error('A Pexels API key is required.')
    this.#apiKey = options.apiKey.trim()
    this.#perPage = options.perPage ?? 20
    this.#cacheTtlMs = options.cacheTtlMs ?? 30_000
    this.onEvent((event) => console.info('[media-core]', event))
  }

  onEvent(listener: MediaEventListener): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  trackView(mediaType: MediaKind, mediaId: number): void {
    this.#emit({ type: 'view', mediaType, mediaId, timestamp: Date.now() })
  }

  trackDownload(mediaType: MediaKind, mediaId: number): void {
    this.#emit({ type: 'download', mediaType, mediaId, timestamp: Date.now() })
  }

  searchPhotos(query: string, options: SearchOptions = {}): Promise<PexelsPage<PexelsPhoto>> {
    return this.#request(`/v1/search${buildQuery({ query, ...this.#params(options) })}`)
  }

  curatedPhotos(options: SearchOptions = {}): Promise<PexelsPage<PexelsPhoto>> {
    return this.#request(`/v1/curated${buildQuery(this.#params(options))}`)
  }

  getPhoto(id: number): Promise<PexelsPhoto> {
    return this.#request(`/v1/photos/${id}`)
  }

  searchVideos(query: string, options: SearchOptions = {}): Promise<PexelsPage<PexelsVideo>> {
    return this.#request(`/videos/search${buildQuery({ query, ...this.#params(options) })}`)
  }

  popularVideos(options: SearchOptions = {}): Promise<PexelsPage<PexelsVideo>> {
    return this.#request(`/videos/popular${buildQuery(this.#params(options))}`)
  }

  getVideo(id: number): Promise<PexelsVideo> {
    return this.#request(`/videos/videos/${id}`)
  }

  clearCache(): void {
    this.#cache.clear()
  }

  #params(options: SearchOptions): Record<string, string | number | undefined> {
    return {
      page: options.page ?? 1,
      per_page: options.perPage ?? this.#perPage,
      orientation: options.orientation,
      size: options.size,
      locale: options.locale,
      color: options.color,
    }
  }

  #emit(event: MediaActivityEvent): void {
    for (const listener of this.#listeners) {
      try {
        listener(event)
      } catch (error) {
        console.error('[media-core] Event listener failed.', error)
      }
    }
  }

  async #request<T>(endpoint: string): Promise<T> {
    const cacheKey = `https://api.pexels.com${endpoint}`
    const now = Date.now()
    for (const [key, entry] of this.#cache) {
      if (entry.expiresAt <= now) this.#cache.delete(key)
    }

    const existing = this.#cache.get(cacheKey)
    if (existing) {
      this.#cache.delete(cacheKey)
      this.#cache.set(cacheKey, existing)
      return existing.promise as Promise<T>
    }

    while (this.#cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = this.#cache.keys().next().value
      if (oldestKey === undefined) break
      this.#cache.delete(oldestKey)
    }

    const request = fetch(cacheKey, { headers: { Authorization: this.#apiKey } })
      .then(async (response) => {
        if (!response.ok) {
          let message = `Pexels request failed (${response.status}).`
          try {
            const body = (await response.json()) as { error?: string }
            message = body.error ?? message
          } catch {
            // Keep the status-based message when the response has no JSON body.
          }
          throw new MediaApiError(message, response.status, endpoint)
        }
        return (await response.json()) as T
      })
      .catch((error: unknown) => {
        if (this.#cache.get(cacheKey)?.promise === request) this.#cache.delete(cacheKey)
        throw error
      })

    this.#cache.set(cacheKey, { expiresAt: Date.now() + this.#cacheTtlMs, promise: request })
    return request
  }
}

export function createMediaClient(options: MediaClientOptions): MediaClient {
  return new MediaClient(options)
}