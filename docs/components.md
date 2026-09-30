# Headless Component Reference

## Headless contract

`@owl-media/media-ui-react` and `@owl-media/media-ui-native` are independent from `media-core`, `media-react`, and `media-native`. They do not know about Pexels, fetch data, own application-level selection/pagination state, or ship mandatory styles. They export hooks that accept consumer data and callbacks and return props for consumer-selected elements. The consuming app owns markup, layout, colors, media rendering, loading/error states, and interaction composition.

These exports are behavior/accessibility helpers, not prebuilt Grid, Lightbox, or Swiper visual components. The React web app demonstrates the composition.

## media-ui-react

### Grid: `useMediaGrid`

Inputs are `items`, `getKey(item)`, `onSelect(item)`, and optional accessible list `label`. It returns the same `items`, `getGridProps()` for list semantics, `getItemProps(item)` with a stable React `key` and list-item role, and `getButtonProps(item)` with button type and selection callback. It does not implement loading, load more, or infinite scrolling. Combine it with `usePhotoSearch`/`useVideoSearch`; the app renders those states and calls the data hook's `loadMore()` from a button or its own scroll observer.

```tsx
const grid = useMediaGrid({
  items: photos,
  getKey: (photo) => photo.id,
  onSelect: setSelectedPhoto,
  label: 'Photo results',
})

<div {...grid.getGridProps()}>
  {photos.map((photo) => (
    <article {...grid.getItemProps(photo)} key={photo.id}>
      <button {...grid.getButtonProps(photo)} aria-label={`Open ${photo.alt}`}>
        <img src={photo.src.medium} alt={photo.alt} />
      </button>
    </article>
  ))}
</div>
```

The helper adds list semantics; provide a meaningful accessible name for each action button in consumer markup. The consumer chooses the grid element and CSS.

### Lightbox: `useLightbox`

Inputs are a dialog `label` and `onClose()` callback. `getDialogProps()` returns `role="dialog"`, `aria-modal`, and the label. `getCloseButtonProps()` returns a button type, accessible close label, and callback. `getBackdropProps()` returns a click handler that calls `onClose`. The application stores the selected item and decides whether the dialog is mounted.

The helper does not implement Escape-key handling, focus movement, focus trapping, or focus restoration. Add these behaviors in the consumer if required. Stop propagation from clicks inside the dialog so the backdrop handler does not close it.

### Reel: `useReel` and `useReelSwiper`

`useReel({ onNext, onPrevious })` returns region props, previous/next button prop-getters, and local `muted`/`setMuted` state.

`useReelSwiper({ items, getKey, onActiveItemChange, initialIndex? })` adds vertical touch and ArrowUp/ArrowDown navigation, active index/item state, slide prop-getters, and previous/next controls. The callback receives `(item, index)`. The hook does not render slides, apply scroll-snap styles, or animate transitions; the consumer supplies item data and each slide's full-height layout.

```tsx
const swiper = useReelSwiper({
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
</div>
```

### Search field: `useSearchField`

Inputs are controlled `value`, `onChange`, `onSubmit`, and optional accessible `label`. Its label/input/form prop-getters connect consumer-owned form elements; the hook does not execute searches or access the SDK.

## media-ui-native

The native package provides corresponding behavior through React Native-compatible prop-getters:

- `useNativeMediaGrid({ items, getKey, getLabel, onSelect, label? })` returns `items`, an accessible grid label, a string `getKey(item)`, and item pressable props with accessible label and callback. The app chooses `View`, `FlatList`, or another layout.
- `useNativeLightbox({ open, label, onClose })` returns `Modal` props (`visible`, `transparent`, `onRequestClose`) and accessible dialog props for the consumer's modal content.
- `useNativeMediaItem({ label, onPress, disabled? })` returns `Pressable`-compatible role, label, disabled state, and callback props.
- `useNativeSearch({ value, onChangeText, onSubmit })` returns controlled native text-input props.
- `useNativeReel(onNext, onPrevious)` returns native navigation button props and local muted state; the consumer implements the pager/swipe behavior.
- `useNativeReelSwiper({ items, itemExtent, getKey, onActiveItemChange })` returns `ScrollView` paging props, active index/item, and item keys. It derives the active index from vertical scroll offset when momentum ends; `itemExtent` must match the rendered page height.

```tsx
const grid = useNativeMediaGrid({
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
  <View {...lightbox.getDialogProps()}>{/* consumer-rendered content */}</View>
</Modal>

const reel = useNativeReelSwiper({
  items: videos,
  itemExtent: viewportHeight,
  getKey: (video) => video.id,
  onActiveItemChange: (video, index) => setActiveVideo(video),
})
<ScrollView {...reel.getPagerProps()}>
  {reel.items.map((video) => <VideoPage key={reel.getItemProps(video).key} video={video} />)}
</ScrollView>
```

Native consumers select their own React Native elements, styles, list virtualization, video/pager implementation, and platform-specific accessibility behavior. No UI helper imports the data SDK or performs network requests.