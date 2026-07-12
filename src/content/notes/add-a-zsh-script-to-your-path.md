---
title: Add a Zsh Script to Your PATH
tags:
  - zsh
  - command-line
created: 2025-05-23
updated: 2025-05-23
---

Make a new folder to hold your zsh scripts. You can name it whatever you want, but we'll call it `my-bin` in this example.

Open your `.zshrc` (zsh configuration) with `nano ~/.zshrc`.

Add this line to the end of the file: `export PATH="$HOME/my-bin:$PATH"`.  This tells your shell to look in `~/my-bin` for executables before checking the other directories in your PATH.

Save the file and close nano.

Run `source ~/.zshrc` to affect the changes.