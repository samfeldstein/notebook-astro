---
title: Animate Link Underline with CSS
aliases:
  - Animate Link Underline with CSS
tags:
  - css
  - web-development
created: 2025-07-11
updated: 2025-07-11
---

```css
a {
  position: relative;
  text-decoration: none;
}

a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px; /* thickness of the underline */
  width: 0; /* start with zero width */
  background: black; /* underline color */
  transition: width 0.3s ease;
}

a:hover::after {
  width: 100%; /* animate to full width */
}
```
