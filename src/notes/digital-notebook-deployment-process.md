---
title: Digital Notebook Deployment Process
tags:
  - eleventy
  - cloudflare
created: 2025-05-28
updated: 2025-05-28
---

Build and push manually. I started doing this because I was having trouble with my atom feed. When I built locally, everything is in the correct order (descending chronologically, according to most recently updated). But when Cloudflare built the site, the feed was out of order. I couldn't figure out why, so I eliminated that step.

I don't mind building locally too much, because it gives me a chance to catch errors.