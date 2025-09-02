---
title: Optimize Web Fonts
tags:
  - web-performance
  - web-development
  - fonts
  - css
created: 2024-12-27
updated: 2024-12-27
---

If using a [CDN](https://web.dev/articles/content-delivery-networks) (like [Cloudflare](https://developers.cloudflare.com/workers/)), self-host your fonts. Otherwise, serve remotely with [Google Fonts](https://fonts.google.com) or another service.

## Self-hosting

- Use [[font-subsetting|subsets]]
- Use [[fallback-fonts|fallback fonts]] with [`size-adjust`](https://web.dev/articles/css-size-adjust)
- [[preload-fonts|Preload]] critical fonts

## Serving from a remote service

- Use `preconnect`

## Further reading

- [Web Font Best Practices](https://web.dev/articles/font-best-practices)
- [A Comprehensive Guide to Font Loading Strategies](https://www.zachleat.com/web/comprehensive-webfonts/)