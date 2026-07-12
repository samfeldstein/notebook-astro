---
title: Visually Hide With CSS
aliases: Visually Hide With CSS
tags:
  - css
created: 2025-10-08
updated: 2025-10-08
---

Hides content visually but keeps it accessible to screen readers.

For static content:

```css
.visually-hidden:not(:focus):not(:active) {
  clip: rect(0 0 0 0); 
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap; 
  width: 1px;
}
```

Code changes for interactive content. There are multiple ways to do it depending on how you want to animate the hidden element onto the screen. Here's a basic skiplink example:

```css
.skip-link {
  position: fixed;
  left: 0;
  top: 0;
  transform: translateY(-10em);
  transition: all 0.2s ease-in-out;
}

.skip-link:focus {
  transform: translateY(0em);
}
```

## Further reading

- [Inclusively Hidden](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html) by Scott O'Hara