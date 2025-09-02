---
title: Relative Links and Static Site Generators
tags:
  - static-site-generators
  - html
  - markdown
---

## The Problem

Relative links work fine in a vanilla site. Eg:

```
index.html
  notes/
    index.html
    note.html
    sibling-note.html
```

You can link from *note* to *sibling note* like this `href="sibling-note.html"` and it works fine.

However, if you do this in 11ty or Astro, you have problems. Take an Astro example:

```
index.md
  notes/
    note.md
    sibling-note.md
```

If you link from `note` to `sibling-note` like this: `href="sibling-note`, you get `/sibling-note` in the url, as opposed to `notes/sibling-note`.

Same thing happens in Hugo and 11ty, and sometimes you end up with this:

`http://localhost:1313/notes/note/sibling-note`

I don't know why this happens.

What I'd like to do is take advantage of vanilla html, which apparently handles relative links just fine, and apply it any given SSG.

## Solution

[11ty Foam template](https://github.com/juanfrank77/foam-eleventy-template) has a solution for this for this using the Markdown-It npm package. It works!

## Help

- [MDN Docs Hyperlinks Primer](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks#a_quick_primer_on_urls_and_paths)
