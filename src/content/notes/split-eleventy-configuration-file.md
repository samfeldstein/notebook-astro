---
title: Split Eleventy Configuration File
tags:
  - eleventy
created: 2025-05-28
updated: 2025-05-28
---

Create a folder for your configuration files. You can call it what you want. I'll call it `config`.

Create a configuration file. I'll use `collections.js` as an example:

```js
export default function (eleventyConfig) {
	eleventyConfig.addCollection("notes", function (collectionApi) {
	return collectionApi.getFilteredByGlob("content/notes/*.md");
	});
}
```

The above function returns a collection called *notes.* It takes `eleventyConfig` as a parameter because `eleventyConfig` isn't a global variable, meaning it's only available within the main config function that Eleventy calls. When you split your config, you need to pass `eleventyConfig` down to each module so they can call methods like `addCollection()`, `addFilter()`, etc.

Import the function into your main configuration file (mine's called `.eleventy.js`):

```js
import collections from './config/collections.js';
```

Then call the function inside your `eleventyConfig` function:

```js
export default function (eleventyConfig) {
	collections(eleventyConfig);
}
```

## Further reading

- [Eleventy Configuration](https://www.11ty.dev/docs/config/)
- [Organizing the Eleventy Config File](https://www.lenesaile.com/en/blog/organizing-the-eleventy-config-file/)