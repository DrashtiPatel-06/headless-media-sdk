import { useId, useRef, useState, type FormEvent, type TouchEvent } from 'react'

export interface SearchFieldOptions {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  label?: string
}

export function useSearchField({ value, onChange, onSubmit, label = 'Search media' }: SearchFieldOptions) {
  const inputId = useId()
  return {
    getLabelProps: () => ({ htmlFor: inputId }),
    getInputProps: () => ({
      id: inputId,
      type: 'search' as const,
      value,
      'aria-label': label,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value),
    }),
    getFormProps: () => ({
      role: 'search' as const,
      onSubmit: (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSubmit(value)
      },
    }),
  }
}

export interface MediaGridOptions<T> {
  items: T[]
  getKey: (item: T) => string | number
  onSelect: (item: T) => void
  label?: string
}

export function useMediaGrid<T>({ items, getKey, onSelect, label = 'Media results' }: MediaGridOptions<T>) {
  return {
    getGridProps: () => ({ role: 'list' as const, 'aria-label': label }),
    getItemProps: (item: T) => ({
      key: getKey(item),
      role: 'listitem' as const,
    }),
    getButtonProps: (item: T) => ({
      type: 'button' as const,
      onClick: () => onSelect(item),
    }),
    items,
  }
}

export interface LightboxOptions {
  label: string
  onClose: () => void
}

export function useLightbox({ label, onClose }: LightboxOptions) {
  return {
    getDialogProps: () => ({ role: 'dialog' as const, 'aria-modal': true as const, 'aria-label': label }),
    getCloseButtonProps: () => ({ type: 'button' as const, onClick: onClose, 'aria-label': 'Close media viewer' }),
    getBackdropProps: () => ({ onClick: onClose }),
  }
}

export interface ReelOptions {
  onNext: () => void
  onPrevious: () => void
}

export function useReel({ onNext, onPrevious }: ReelOptions) {
  const [muted, setMuted] = useState(true)
  return {
    muted,
    setMuted,
    getReelProps: () => ({ role: 'region' as const, 'aria-label': 'Video reel' }),
    getNextButtonProps: () => ({ type: 'button' as const, onClick: onNext, 'aria-label': 'Next video' }),
    getPreviousButtonProps: () => ({ type: 'button' as const, onClick: onPrevious, 'aria-label': 'Previous video' }),
  }
}

export interface ReelSwiperOptions<T> {
  items: T[]
  getKey: (item: T) => string | number
  onActiveItemChange: (item: T, index: number) => void
  initialIndex?: number
}

export function useReelSwiper<T>({ items, getKey, onActiveItemChange, initialIndex = 0 }: ReelSwiperOptions<T>) {
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, Math.min(initialIndex, items.length - 1)))
  const touchStartY = useRef<number | null>(null)
  const activeItem = items[activeIndex]

  function selectIndex(index: number): void {
    if (items.length === 0) return
    const nextIndex = Math.max(0, Math.min(index, items.length - 1))
    if (nextIndex === activeIndex) return
    setActiveIndex(nextIndex)
    onActiveItemChange(items[nextIndex], nextIndex)
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>): void {
    touchStartY.current = event.touches[0]?.clientY ?? null
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>): void {
    const startY = touchStartY.current
    const endY = event.changedTouches[0]?.clientY
    touchStartY.current = null
    if (startY === null || endY === undefined || Math.abs(startY - endY) < 40) return
    selectIndex(activeIndex + (startY > endY ? 1 : -1))
  }

  return {
    items,
    activeItem,
    activeIndex,
    getReelProps: () => ({
      role: 'region' as const,
      'aria-label': 'Media reel',
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'ArrowDown') selectIndex(activeIndex + 1)
        if (event.key === 'ArrowUp') selectIndex(activeIndex - 1)
      },
    }),
    getItemProps: (item: T, index: number) => ({
      key: getKey(item),
      role: 'group' as const,
      'aria-label': `Item ${index + 1} of ${items.length}`,
      'aria-current': index === activeIndex ? 'true' as const : undefined,
    }),
    getPreviousButtonProps: () => ({ type: 'button' as const, disabled: activeIndex <= 0, onClick: () => selectIndex(activeIndex - 1), 'aria-label': 'Previous item' }),
    getNextButtonProps: () => ({ type: 'button' as const, disabled: activeIndex >= items.length - 1, onClick: () => selectIndex(activeIndex + 1), 'aria-label': 'Next item' }),
  }
}