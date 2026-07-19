---
title: Compress PDFs
aliases: Compress PDFs
tags:
private: false
created: 2026-06-20
updated: 2026-06-20
---

GhostScript command line tool.

**Filenames must be different.**

Best settings for screen:

```shell
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dBATCH -sOutputFile=output.pdf input.pdf
```

For ebook:

```shell
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile=output.pdf input.pdf
```