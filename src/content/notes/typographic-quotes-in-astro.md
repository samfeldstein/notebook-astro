---
title: Typographic Quotes in Astro
aliases:
  - Typographic Quotes in Astro
  - Curly Quotes in Astro
tags: 
created: 2025-07-24
updated: 2025-07-24
---

## In markdown files

Astro supports Remark plugins. `remark-smartypants` is a Remark plugin that adds [Smartypants](https://daringfireball.net/projects/smartypants/) to your markdown config. Smartypants converts straight quotes (`'`) to curly (typographical quotes) (`’`).

Install `remark-smartypants`:

```bash
npm i remark-smartypants
```

Add it to your Astro config:

```js
// astro.config.mjs

import remarkSmartypants from 'remark-smartypants'

  

// https://astro.build/config

export default defineConfig({
	markdown: {
		remarkPlugins: [remarkSmartypants],
},
```

## In .astro/.html files

No good solution. Maybe just use MDX for everything? Then the above plugin will apply.