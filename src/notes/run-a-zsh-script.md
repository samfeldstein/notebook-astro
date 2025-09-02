---
title: Run a Zsh Script
tags:
  - zsh
  - command-line
created: 2025-05-22
updated: 2025-05-23
---

Create a new file. Let's call it `myscript`. You don't need an extension, but you do need to put `#!/bin/zsh` at the top of the file to tell your system that this is a zsh script.

The file must be in your `bin` or in your `$PATH`. On a Mac, the path to your `bin` usually looks like `/usr/local/bin`. If you want to keep your custom scripts in a separate folder, you have to [[add-a-zsh-script-to-your-path|add that folder to your `$PATH`]].

Make it executable. Run `chmod +x myscript`.

Run `myscript`.