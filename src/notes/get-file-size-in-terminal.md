---
title: Get File Size in Terminal
aliases:
  - Get File Size in Terminal
tags:
  - command-line
created: 2025-06-22
updated: 2025-06-22
---

For a single file:

```bash
ls -l example.txt | awk '{print $5}'
```

For all files in a folder, sorted smallest to largest:

```bash
ls -l | awk '{print $5, $9}' | sort -n
```

For all files in folders and subfolders:

```bash
find . -type f -exec ls -l {} + | awk '{print $5, $9}' | sort -n
```