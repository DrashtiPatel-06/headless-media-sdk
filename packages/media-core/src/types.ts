export interface PexelsPage<T> {
  page: number
  per_page: number
  total_results: number
  next_page?: string
  prev_page?: string
  photos?: T[]
  videos?: T[]
}

export interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string | null
  alt: string
  liked: boolean
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
}

export interface PexelsVideoFile {
  id: number
  quality: string
  file_type: string
  width: number | null
  height: number | null
  fps: number | null
  link: string
}

export interface PexelsVideoPicture {
  id: number
  picture: string
  nr: number
}

export interface PexelsVideo {
  id: number
  width: number
  height: number
  url: string
  image: string
  duration: number
  user: {
    id: number
    name: string
    url: string
  }
  video_files: PexelsVideoFile[]
  video_pictures: PexelsVideoPicture[]
}

export type MediaKind = 'photo' | 'video'
export type MediaActivityType = 'view' | 'download'

export interface MediaActivityEvent {
  type: MediaActivityType
  mediaType: MediaKind
  mediaId: number
  timestamp: number
}

export type MediaEventListener = (event: MediaActivityEvent) => void

export interface MediaClientOptions {
  apiKey: string
  perPage?: number
  cacheTtlMs?: number
}

export interface SearchOptions {
  page?: number
  perPage?: number
  orientation?: 'landscape' | 'portrait' | 'square'
  size?: 'large' | 'medium' | 'small'
  locale?: string
  color?: string
}

export class MediaApiError extends Error {
  readonly status: number
  readonly endpoint: string

  constructor(message: string, status: number, endpoint: string) {
    super(message)
    this.name = 'MediaApiError'
    this.status = status
    this.endpoint = endpoint
  }
}