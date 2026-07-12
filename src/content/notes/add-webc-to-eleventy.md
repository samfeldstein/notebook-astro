---
title: Add WebC to Eleventy
tags:
  - eleventy
created: 2025-05-28
updated: 2025-05-28
---

```js
import pluginWebc from "@11ty/eleventy-plugin-webc";

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(pluginWebc, {
	// Glob to find no-import global components
	components: "_includes/components/**/*.webc",
	});
}
```
