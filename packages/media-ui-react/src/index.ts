import { useId, useState, type FormEvent } from 'react'

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