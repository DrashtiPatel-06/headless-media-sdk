# Headless Component Guide

`@owl-media/media-ui-react` and `@owl-media/media-ui-native` are independent from the data SDK. They accept values and callbacks; they do not fetch media, configure authentication, or include styles. Render the returned props on your own markup and style that markup in your application.

## React example

```tsx
import { useState } from 'react'
import { useSearchField } from '@owl-media/media-ui-react'

function Search({ onSearch }: { onSearch: (query: string) => void }) {
  const [value, setValue] = useState('')
  const search = useSearchField({ value, onChange: setValue, onSubmit: onSearch })
  return (
    <form {...search.getFormProps()}>
      <label {...search.getLabelProps()}>Find media</label>
      <input {...search.getInputProps()} />
      <button type="submit">Search</button>
    </form>
  )
}
```

Available hooks:

- `useSearchField`: input, label, and form props for controlled search.
- `useMediaGrid`: list semantics, stable item keys, and selection handlers.
- `useLightbox`: dialog semantics, close-button props, and backdrop behavior.
- `useReel`: region semantics, previous/next actions, and mute state.

The app owns markup, CSS, focus treatment, media elements, and composition. Use the `aria-*` attributes and semantic roles returned by the getters; do not replace them with data-SDK logic.

## React Native example

```tsx
import { Pressable, Text } from 'react-native'
import { useNativeMediaItem } from '@owl-media/media-ui-native'

function MediaButton({ title, onOpen }: { title: string; onOpen: () => void }) {
  const item = useNativeMediaItem({ label: title, onPress: onOpen })
  return <Pressable {...item.getPressableProps()}><Text>{title}</Text></Pressable>
}
```

The native package exposes native search, pressable-item, and reel prop-getters. Consumers provide React Native components and all visual styling.