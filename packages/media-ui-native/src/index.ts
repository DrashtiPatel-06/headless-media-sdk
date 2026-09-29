import { useState } from 'react'
import type { GestureResponderEvent } from 'react-native'

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