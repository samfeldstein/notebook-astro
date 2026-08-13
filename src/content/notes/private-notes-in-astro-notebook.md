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

I also added a `private` key in note frontmatter and filtered them that way, just for extra protection. But that alone won't do because then they'll end up in GitHub.

You can use `_private` which tells Astro to exclude the folder from build, but then you can't see private notes on the dev server.