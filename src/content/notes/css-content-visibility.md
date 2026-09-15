---
title: CSS Content Visibility
tags:
  - css
  - web-performance
private: false
created: 2025-07-25
updated: 2026-09-14
---

`content-visibility` lets you defer elements so they won't be rendered until the user needs them.

Must be used with `contain-intrinsic-size` or the hidden elements will each have 0 height and all enter the viewport at the same time

Example:

```css
.defer {
	content-visibility: auto;
	contain-intrinsic-size: auto 300px auto 100vh;
}
```

## Issues

I've had issues with anchor links. Content may not be rendered yet so it jumps to the wrong part of the page.

## Further reading

- [content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) on MDN
- [Slashing layout cost with content-visibility](https://youtu.be/FFA-v-CIxJQ?si=1gehTFCAf8sc62LX)