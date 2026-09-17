---
title: Cloudflare HTTP Header Caching
private: false
created: 2026-09-15
updated: 2026-09-15
tags:
  - web-development
  - web-performance
  - cloudflare
---

`_headers` file only works in Cloudflare Pages. [Cloudflare default caching](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#default-cached-file-extensions) is pretty good.

For static sites, I like to add a rule to cache `.html` files for five hours. In the sidebar, go to `Caching > Cache Rules`. Click `Create Rule` and select `Cache Response Rule.`

Use `https://samfeldstein.xyz/*.html` to target the apex domain and `https://*.samfeldstein.xyz/*.html` to target subdomains. Don't use `https://*samfeldstein.xyz/*.html` because that will match anything like `https://evilsamfeldstein.xyz/*.html`. Make sure you select `OR`, not `AND`.

Select `Modify cache-control directives` and set the `Max-age` to `18000` seconds (five hours).