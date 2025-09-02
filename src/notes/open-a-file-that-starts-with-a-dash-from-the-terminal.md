---
title: Open a File That Starts With a Dash From the Terminal
aliases:
  - Open a File That Starts With a Dash From the Terminal
tags:
  - command-line
created: 2025-06-21
updated: 2025-06-21
---

When a filename starts with a dash (`-`), the terminal can confuse it for a command option. Use `./-filename` instead.

Example:

```bash
cat ./-filename
```