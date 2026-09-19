---
title: Private Notes in Astro Notebook
tags: [astro]
private: false
created: 2026-07-12
updated: 2026-07-12
---

As long as `dist` and the folder containing the private notes is in `.gitignore`, we should be good. Cloudflare builds from the GitHub repo, so if the notes aren't there, it can't render them.

They will still build locally, so you can view them on the dev server.

I also added a `private` key in note frontmatter and used a `getPublicNotes` helper function to filter them from production builds.

## Underscore naming convention

A la `_private`. Not relevant here, as it only works on files in the `pages` directory.
