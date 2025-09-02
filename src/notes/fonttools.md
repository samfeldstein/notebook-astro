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

Read more in the [docs](https://fonttools.readthedocs.io/en/latest/index.html).