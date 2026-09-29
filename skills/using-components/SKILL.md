---
name: media-headless-components
description: Use when building React or React Native UI with media-ui-react or media-ui-native prop-getters and hooks.
---

# Use Headless Media Components

## Required contract

- Import UI helpers only from the platform UI package. They must not import a data wrapper or SDK.
- Treat every helper as behavior and accessibility props, not as a visual component.
- The consuming app owns markup, visual styles, spacing, responsive behavior, and media data.
- Spread getter props onto the matching element and preserve returned event handlers, roles, and accessible labels.

## React patterns

- Use `useSearchField` for a controlled input and form submission.
- Use `useMediaGrid` with stable media IDs and a callback that receives the selected item.
- Use `useLightbox` for dialog labeling and close behavior; provide a visible close control.
- Use `useReel` for previous/next callbacks and mute state. Keep the actual `<video>` element and its visual presentation in the app.

## React Native patterns

- Spread `useNativeMediaItem` props on `Pressable`, not on a web element.
- Use `useNativeSearch` for the native text-input contract and `useNativeReel` for reel navigation.
- Preserve accessibility labels, roles, and disabled state from the getter.
- Build styles with the host app's React Native styling system; none are supplied here.

## Verify before finishing

- No styles or markup are imported from the UI package.
- Interactive targets are keyboard/touch accessible and have names.
- The prop-getter callbacks actually run in the rendered UI.
- UI packages compile independently of `media-core` and platform data wrappers.
- Check the layout at narrow and wide viewports; keep media dimensions stable while loading.