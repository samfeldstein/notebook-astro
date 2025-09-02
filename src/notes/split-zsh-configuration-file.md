---
title: Split Zsh Configuration File
aliases:
  - Split Zsh Configuration File
tags:
  - zsh
  - command-line
created: 2025-06-17
updated: 2025-06-17
---

Make a folder in for your zsh configuration files. Mine's called `.zsh` and I put it in my home (`~/`) directory. Put whatever configuration files you want in there. For example, `aliases.zsh`.

Add this code to your `.zshrc` file:

```bash
for file in ~/.zsh/*.zsh; do
  source "$file"
done
```

Run `source ~/.zshrc`.