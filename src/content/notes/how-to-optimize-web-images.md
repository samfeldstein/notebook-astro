---
title: How to Optimize Web Images
tags:
  - web-development
  - web-performance
private: false
created: 2024-12-27
updated: 2026-08-14
---

- [[notes/compress-images|Compress images]]
- [Optimize SVGs](https://jakearchibald.github.io/svgomg/)
- Serve different formats and sizes using Astro's `<Picture/>` component
- Use the [`fetchPriority="high"`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority) and `loading="eager"` attributes for critical images
- - Lazy-load non-critical images (Astro `<Picture/>` does this for you
- Fix sizing issues with [RespImageLint](https://ausi.github.io/respimagelint/)
- Check your work with [PageSpeed Insights](https://pagespeed.web.dev)
