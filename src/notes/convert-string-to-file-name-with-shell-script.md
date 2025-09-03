---
title: Convert String to File Name with Shell Script
aliases: Convert String to File Name with Shell Script
tags:
created: 2025-09-02
updated: 2025-09-02
---

```shell
name="$*"

safe_name=$(echo "$name" \
	| sed 's/ /-/g' \
	| tr -cd '[:alnum:]-_.' \
	| tr '[:upper:]' '[:lower:]')

touch "$safe_name"
echo -n "$safe_name" | pbcopy
echo "$safe_name"
```

Copies the name to clipboard and prints it to the console for checking.