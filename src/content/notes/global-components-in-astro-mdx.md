---
title: Global Components in Astro MDX
aliases: Global Components in Astro MDX
tags:
  - astro
created: 2025-09-03
updated: 2025-09-03
---

For a content collection layout `[id].astro`, just do this:

```html
<Content components={{ Backgrounds, StartingMoves, Advances, Drive, Gear }} />
```

You can call any of those components in an MDX collection item without importing them explicitly.

## Further reading

- [Automatically import Components in Astro MDX](https://rimdev.io/automatically-import-components-in-astro-mdx), Ryan Trimble
- [Astro MDX Components](https://blog.kizu.dev/astro-mdx-components/), Roman Komarov