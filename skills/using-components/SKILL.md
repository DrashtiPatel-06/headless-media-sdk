---
name: media-headless-components
description: Use when building React or React Native UI with media-ui-react or media-ui-native prop-getters and hooks.
---

# Use Headless Media Components

Use this skill when composing the hooks exported by `media-ui-react` or `media-ui-native` in an application.

## Contract and boundaries

- Import web helpers from `@owl-media/media-ui-react` and native helpers from `@owl-media/media-ui-native` only.
- Treat exports as hooks/prop-getters, not rendered Grid, Lightbox, or Swiper components.
- Pass media arrays, stable keys/labels, and callbacks from the consumer. Never put Pexels fetching, authentication, or SDK imports in a UI package.
- The consumer owns markup/elements, visual style, media playback, selection state, loading/error/empty states, and pagination policy.
- Spread returned props onto the matching host element; do not overwrite their callbacks, semantic roles, or accessibility values.

## React web patterns

For a grid, call `useMediaGrid({ items, getKey, onSelect, label? })`. Put `getGridProps()` on the list, `getItemProps(item)` on each list item, and `getButtonProps(item)` on the actionable button. Add a useful button `aria-label`; the helper does not infer media labels. Combine data-hook `loading`, `error`, `hasMore`, and `loadMore()` outside the UI helper.

```tsx
const grid = useMediaGrid({
	items,
	getKey: (item) => item.id,
	onSelect: setSelected,
	label: 'Photo results',
})

<div {...grid.getGridProps()}>
	{items.map((item) => (
		<article {...grid.getItemProps(item)} key={item.id}>
			<button {...grid.getButtonProps(item)} aria-label={`Open ${item.alt}`}>
				<img src={item.src.medium} alt={item.alt} />
			</button>
		</article>
	))}
</div>
```

For a lightbox, call `useLightbox({ label, onClose })`, mount based on consumer selection, spread backdrop/dialog/close getters on their elements, and stop click propagation inside the dialog. The hook does not implement Escape handling or focus management; add and test them in the consuming application when required.

For a basic reel, call `useReel({ onNext, onPrevious })`; it provides region/navigation props and `muted`/`setMuted`. For touch/keyboard paging with active-item tracking, use `useReelSwiper({ items, getKey, onActiveItemChange, initialIndex? })`. Spread `getReelProps()` on a focusable container and `getItemProps(item, index)` on each slide. The hook reports `(item, index)` but does not render slides, apply scroll-snap styles, or animate transitions; render the actual `<video>` and style each slide in the app.

Use `useSearchField({ value, onChange, onSubmit, label? })` for controlled search input/form prop-getters. Search logic remains in the app/data layer.

## React Native patterns

Use `useNativeMediaGrid({ items, getKey, getLabel, onSelect, label? })`; spread `getGridProps()` on the chosen container, use `getKey(item)` as the React key, and spread `getItemProps(item).getPressableProps()` on `Pressable`. `getLabel` supplies the item's accessibility label.

Use `useNativeLightbox({ open, label, onClose })`; spread `getModalProps()` on React Native `Modal` and `getDialogProps()` on the accessible content container. The app provides modal contents and styles.

Use `useNativeMediaItem({ label, onPress, disabled? })` for a single `Pressable`, `useNativeSearch({ value, onChangeText, onSubmit })` for a controlled native input, and `useNativeReel(onNext, onPrevious)` for navigation callbacks/muted state. For a `ScrollView` reel, use `useNativeReelSwiper({ items, itemExtent, getKey, onActiveItemChange })`; spread `getPagerProps()` on the vertical `ScrollView`, set each rendered page to `itemExtent`, and use the callback to synchronize the active item. The app still renders each video page.

Keep platform-specific elements native (`Pressable`, `View`, `Modal`, `TextInput`, `Image`); do not spread web DOM props onto them. Build styles with the app's React Native styling system; the package ships none.

## Accessibility and review

- Keep interactive targets named and keyboard/touch reachable; preserve helper labels and roles.
- Verify the button callback, backdrop close callback, and next/previous callbacks from rendered controls.
- Add focus handling for web dialogs if needed; the current lightbox helper does not trap or restore focus.
- Verify web touch/Arrow-key changes and native momentum paging update the active media selection.
- Do not add imports from `media-core`, `media-react`, or `media-native` to either UI package.
- Test consumer layouts at narrow and wide sizes and verify the consumer's selected media/pager behavior independently.