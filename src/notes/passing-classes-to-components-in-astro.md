---
title: Passing Classes to Components in Astro
aliases:
  - Passing Classes to Components in Astro
tags:
  - astro
created: 2025-07-31
updated: 2025-07-31
---

`{...Astro.props}` is a way to forward all received props from a parent component to an element inside your Astro component. This is useful for passing classes, styles, or other attributes without having to specify each one.

```html
<!-- src/components/Button.astro -->
<button {...Astro.props}>My Button</button>
```

```html
<Button class="primary" />
```

The `<button>` receives `class="primary"` automatically.