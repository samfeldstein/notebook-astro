---
title: Convert String to File Name with Shell Script
aliases: Convert String to File Name with Shell Script
tags:
private: false
created: 2025-09-02
updated: 2026-03-25
---

```shell
#!/usr/bin/env bash
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

If you don't want to have to put the string in quotes, you can add a `noglob` prefix to the alias you use to call the script. Example:

```shell
alias fn="noglob mkfilename"
```