---
title: Private Notes in Astro Notebook
aliases: Private Notes in Astro Notebook
tags:
created: 2026-07-12
updated: 2026-07-12
---

As long the folder containing the private notes is in `.gitignore`, we should be good. Cloudflare builds from the GitHub repo, so if the notes aren't there, it can't render them.

The `_` in `notes/_private` tells Astro not to build that folder in production. Because it is inside a folder that does build, Astro will still render the privates notes on the dev server.