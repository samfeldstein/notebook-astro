---
title: Load JavaScript on a Web Page
aliases:
  - Load JavaScript on a Web Page
tags:
  - javascript
  - web-development
created: 2025-06-21
updated: 2025-06-21
---

Unless you have some reason not to, the best way to load JavaScript on a web page is to use the `type="module"` attribute:

```html
<script type="module" src="main.js"></script>
```

You don't need the `defer` attribute; modules are deferred automatically.

Modules are only executed once, even if they're referenced in multiple `<script>` tags.

## Further reading

- [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)