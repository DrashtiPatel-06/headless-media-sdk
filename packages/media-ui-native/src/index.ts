import { useState } from 'react'
import type { GestureResponderEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

export interface NativeMediaItemOptions {
  label: string
  onPress: (event: GestureResponderEvent) => void
  disabled?: boolean
}

export function useNativeMediaItem({ label, onPress, disabled = false }: NativeMediaItemOptions) {
  return {
    getPressableProps: () => ({
      accessibilityRole: 'button' as const,
      accessibilityLabel: label,
      accessibilityState: { disabled },
      disabled,
      onPress,
    }),
  }
}

export interface NativeMediaGridOptions<T> {
  items: T[]
  getKey: (item: T) => string | number
  getLabel: (item: T) => string
  onSelect: (item: T) => void
  label?: string
}

export function useNativeMediaGrid<T>({ items, getKey, getLabel, onSelect, label = 'Media results' }: NativeMediaGridOptions<T>) {
  return {
    items,
    getGridProps: () => ({ accessibilityLabel: label }),
    getKey: (item: T) => String(getKey(item)),
    getItemProps: (item: T) => ({
      getPressableProps: () => ({
        accessibilityRole: 'button' as const,
        accessibilityLabel: getLabel(item),
        onPress: () => onSelect(item),
      }),
    }),
  }
}

export interface NativeLightboxOptions {
  open: boolean
  label: string
  onClose: () => void
}

export function useNativeLightbox({ open, label, onClose }: NativeLightboxOptions) {
  return {
    getModalProps: () => ({ visible: open, transparent: true, onRequestClose: onClose }),
    getDialogProps: () => ({ accessible: true, accessibilityLabel: label, accessibilityViewIsModal: true }),
  }
}

export interface NativeSearchOptions {
  value: string
  onChangeText: (value: string) => void
  onSubmit: (value: string) => void
}

export function useNativeSearch({ value, onChangeText, onSubmit }: NativeSearchOptions) {
  return {
    getInputProps: () => ({
      value,
      onChangeText,
      onSubmitEditing: () => onSubmit(value),
      accessibilityLabel: 'Search media',
      returnKeyType: 'search' as const,
    }),
  }
}

export function useNativeReel(onNext: () => void, onPrevious: () => void) {
  const [muted, setMuted] = useState(true)
  return {
    muted,
    setMuted,
    getNextButtonProps: () => ({ accessibilityRole: 'button' as const, accessibilityLabel: 'Next video', onPress: onNext }),
    getPreviousButtonProps: () => ({ accessibilityRole: 'button' as const, accessibilityLabel: 'Previous video', onPress: onPrevious }),
  }
}

export interface NativeReelSwiperOptions<T> {
  items: T[]
  itemExtent: number
  getKey: (item: T) => string | number
  onActiveItemChange: (item: T, index: number) => void
}

export function useNativeReelSwiper<T>({ items, itemExtent, getKey, onActiveItemChange }: NativeReelSwiperOptions<T>) {
  const [activeIndex, setActiveIndex] = useState(0)

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    if (items.length === 0 || itemExtent <= 0) return
    const index = Math.max(0, Math.min(Math.round(event.nativeEvent.contentOffset.y / itemExtent), items.length - 1))
    if (index === activeIndex) return
    setActiveIndex(index)
    onActiveItemChange(items[index], index)
  }

  return {
    items,
    activeIndex,
    activeItem: items[activeIndex],
    getPagerProps: () => ({ pagingEnabled: true, onMomentumScrollEnd: handleMomentumScrollEnd }),
    getItemProps: (item: T) => ({ key: String(getKey(item)) }),
  }
}