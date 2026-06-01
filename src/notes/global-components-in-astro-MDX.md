---
title: Global Components in Astro MDX
aliases: Global Components in Astro MDX
tags:
  - astro
created: 2025-09-03
updated: 2025-09-03
---

[Ryan Trimble's solution](https://rimdev.io/automatically-import-components-in-astro-mdx) works perfectly. This specific method only works for `MDX` files. I'm not sure how you'd tweak it to work with `.astro` files.

Make a file: `src/components/global.js'

```js
import Component from "./Component.astro";

export const components = { Component }
```

In `[id].astro`, import the `components` object:

```js
import { components } from "path/to/components/global";
```

Then in the layout:

```html
`<Content components={components}/>
```

## Further reading

- [Automatically import Components in Astro MDX](https://rimdev.io/automatically-import-components-in-astro-mdx), Ryan Trimble
- [Astro MDX Components](https://blog.kizu.dev/astro-mdx-components/), Roman Komarov