---
title: Open Graph URL in Astro
tags:
  - web-development
  - astro
created: 2025-06-10
updated: 2025-06-10
---

```html
<meta property="og:url" content={Astro.url} />
```

Make sure you set your `site` property in your Astro config, otherwise Astro will use `https://localhost:4321` as the base URL.

`astro.config.js` example:

```ts
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: "https://samfeldstein.xyz"
});
```

## Further reading

- [Astro Runtime API Render Context](https://docs.astro.build/en/reference/api-reference/#url)