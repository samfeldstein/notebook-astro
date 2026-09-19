---
title: Switching to Foam from Obsidian
tags:
  - foam
  - knowledge-management
private: false
created: 2026-09-19
updated: 2026-09-19
---

Trying out [Foam](https://foam.md/) for my notebook. Reason was that [[use-mdx-with-obsidian|Obsidian doesn't play nice with MDX files]]. Costs nothing to switch so worth a shot.

## Obsidian pros

Syncs with Readwise. I think Obsidian has to be open for sync to work.

Alternative is to find or write a local app or VS Code plugin to sync my notes locally.

## Issues

**Foam uses relative Wikilinks**, where each link is just the title of the note. Not sure if there is a way to change that with Foam. My Remark plugin in my Astro config resolves those Wikilinks correctly, but only if the note lives in the top level of the `notes` folder. Not a big deal unless I want to insist on rendering my `notes/private` notes on the dev server. Sometimes that's nicer for viewing but not essential.
