---
title: Cache Build Assets in Cloudflare Workers
aliases:
  - Cache Build Assets in Cloudflare Workers
tags:
  - cloudflare
created: 2025-07-26
updated: 2025-07-26
---

For supported frameworks, Workers detects a specified cache directory for reuse in subsequent builds. For example, if building with Astro, Cloudflare looks for the `node_modules/.astro/` folder.

Typically you exclude your `node_modules` folder from git. You can ignore everything except the above folder by adding these lines to your `.gitignore` file:

```txt
node_modules/*
!node_modules/.astro/
```

## Further reading

- [Build Caching](https://developers.cloudflare.com/workers/ci-cd/builds/build-caching/#frameworks) in the Cloudflare Workers documentation