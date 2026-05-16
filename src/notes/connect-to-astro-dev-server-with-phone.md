---
title: Connect to Astro Dev Server with Phone
aliases: Connect to Astro Dev Server with Phone
tags:
created: 2026-05-11
updated: 2026-05-11
---

Add this to your Astro config:

```js
server: { host: true },
```

When you start the dev server, it will generate a remote address that you can connect to on your phone.

This will work on a private network, but may not work on a public network. In that case, you can switch to a hotspot or use [[vs-code-port-forwarding|VS Code port forwarding]].