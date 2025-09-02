---
title: How to Optimize Web Images
tags: 
  - web-development
  - web-performance
created: 2024-12-27
updated: 2024-12-27
---

- Compress.
	- [SVGOMG](https://jakearchibald.github.io/svgomg/)
	- [Squoosh](https://squoosh.app)
		- I'm not sure how necessary this is given the image components and plugins below.
- Serve different formats and sizes using `<srcset>`.
	- The Astro [`<Image/>`](https://docs.astro.build/en/reference/modules/astro-assets/#image-) component automatically generates image variants.
	- The [Eleventy Image Transform plugin](https://www.11ty.dev/docs/plugins/image/#html-transform) does the same thing.
	- [Jampack](https://jampack.divriots.com/features/optimize-images/) has a similar feature.
	- Fix sizing with [RespImageLint](https://ausi.github.io/respimagelint/).
	- Check your work with [PageSpeed Insights](https://pagespeed.web.dev).
- Use the [`fetchPriority="high"`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority) and `loading="eager"` attributes for critical images.
- [Preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) critical images.
	- I'm not sure how to achieve this when using any of the image-variant components/plugins above, because they generate many variants with different hashes.
- Lazy-load non-critical images.
- Fade them in for better perceived performance.