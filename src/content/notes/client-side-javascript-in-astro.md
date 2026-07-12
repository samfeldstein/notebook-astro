---
title: Client-Side JavaScript in Astro
tags:
  - astro
created: 2025-06-01
updated: 2025-06-04
---

```html
<!-- src/components/Example.astro -->

<!-- relative path to script at `src/scripts/example.js` -->
<script src="../scripts/example.js"></script>
```

- The processed script will be injected where it’s declared with [`type="module"`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).
	- `async` and `defer` attributes are unnecessary. Module scripts are always deferred.
- Rendering is not blocked. The browser continues to process the rest of the HTML while the module script and its dependencies load.
- The browser waits for HTML to be processed before executing module scripts. You do not need to listen for the “load” event.
- **If your component is used several times on a page, the script will only be included once.**

## Further reading

- [Import local scripts](https://docs.astro.build/en/guides/client-side-scripts/#import-local-scripts) (Astro docs)
- [Script processing](https://docs.astro.build/en/guides/client-side-scripts/#script-processing) (Astro docs)