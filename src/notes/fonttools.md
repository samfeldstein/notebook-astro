---
title: fonttools
aliases:
  - fonttools
tags:
  - fonts
created: 2025-07-30
updated: 2025-07-30
---

This command converts a font file to `woff` format and selects a basic Latin subset.

```bash
pyftsubset Oswald-VariableFont_wght.ttf \
  --output-file=oswald.woff2 \
  --flavor=woff2 \
  --unicodes="U+0020-007F" \
  --layout-features='*'
```

If you want diacritics, use `U+0020-007F,U+00A0-00FF`. Make sure the ranges are specified in your font file.

Read more in the [docs](https://fonttools.readthedocs.io/en/latest/index.html).