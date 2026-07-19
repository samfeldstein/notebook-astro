---
title: Private Notes in Astro Notebook
aliases: Private Notes in Astro Notebook
tags:
private: false
created: 2026-07-12
updated: 2026-07-12
---

As long as `dist` and the folder containing the private notes is in `.gitignore`, we should be good. Cloudflare builds from the GitHub repo, so if the notes aren't there, it can't render them.

They will still build locally, so you can view them on the dev server.

Using `_private` doesn't make sense, because it's not in the `pages` directory. See [Excluding Pages](https://docs.astro.build/en/guides/routing/#excluding-pages) in the Astro docs.