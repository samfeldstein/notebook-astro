---
title: Private Notes in Eleventy
tags:
  - eleventy
updated: 2025-05-28
---

**Problem:** I want to keep some notes private, but I want to keep them with my public notes so I can link to them in Foam.

**Solution:** Exclude private notes from git and Eleventy's build output.

## Method One: Exclude a Private Folder from Git

Put your private notes in a `private` folder, add that folder to `.gitignore`.

In Eleventy, files added to `.gitignore` are [also ignored by Eleventy](https://www.11ty.dev/docs/ignores/), so they won't show up in the build output.

This is the method I use for this site.

### Downsides

This method is rigid. Let's say you want a recipe to be private for some reason. Do you put it in the `private` folder or the `recipes` folder? You can't have it both ways. If you need this kind of flexibility, Method Two is the answer.

Also, private notes won't appear on your development server. Again, Method Two solves this.

## Method Two: Filter Private Notes With Frontmatter

See [Eleventy Preprocessors](https://www.11ty.dev/docs/config-preprocessors/).

The advantage to this method is that it allows you to view private notes on the local site, while excluding them from the public site.

It's also more flexible, because the notes aren't locked into a `private` folder.

```js
  eleventyConfig.addProcessor("private", "njk,md", (data, content) => {
    // If `private` is truthy in the template’s Data Cascade, ignore the file.
    if (data.private) {
      return false;
    }
    return content;
  });
```

### Downsides

**Private notes are still pushed to GitHub**. This only matters if your repo is public.
