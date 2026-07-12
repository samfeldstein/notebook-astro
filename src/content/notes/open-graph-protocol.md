---
title: Open Graph Protocol
tags:
  - web-development
created: 2025-06-10
updated: 2025-06-10
---

Open Graph is a way to define how your page looks when shared on social media (title, image, description, etc.).

To enable, the following prefix to your `html` tag. It tells the browser and social platforms that the page uses Open Graph tags with the prefix `og`.

```html
<html prefix="og: https://ogp.me/ns#">
```

Example (taken from my [shelf talker app)](https://shelf-talker.pages.dev/):

```html
<!-- Open Graph markup -->
<meta property="og:title" content="Shelf Talkers" />
<meta property="og:description" content="Simple app for generating formatted shelf talkers." />
<meta property="og:type" content="website" />
<meta
  property="og:image"
  content="https://shelf-talker.pages.dev/open-graph-image.jpg"
/>
<meta property="og:url" content="https://shelf-talker.pages.dev/" />

<!-- Twitter markup (also handles Bluesky) -->
<meta name="twitter:title" content="Shelf Talkers" />
<meta name="twitter:description" content="Simple app for generating formatted shelf talkers." />
<meta
  name="twitter:image"
  content="https://shelf-talker.pages.dev/open-graph-image.jpg"
/>
```

Check your work at [opengraph.xyz](https://www.opengraph.xyz/).

## Further reading

- [Open Graph Protocol website](https://ogp.me/)