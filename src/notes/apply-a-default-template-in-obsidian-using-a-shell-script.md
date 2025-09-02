---
title: Apply a Default Template in Obsidian Using a Shell Script
tags:
  - obsidian
  - zsh
  - command-line
created: 2025-05-23
updated: 2025-05-23
---

**Note:** This method requires you to switch to the terminal to create notes. I don't find it to be that big a deal, especially because I have a shortcut set up with [Quicksilver](https://qsapp.com/), but if that sounds like a pain in the ass, this method probably won't work for you.

---

As far as I know, there's no way to apply a default template to new notes in Obsidian. I had Claude write a shell script that does the same thing.

The script creates a new markdown file, inserts YAML frontmatter, and opens the file automatically in Obsidian.

If you don’t know how to create a shell script, see [[run-a-zsh-script|How to Run a Zsh Script]].

## Usage

Create a private note:

```zsh
new-note "Journal Entry"
```

Create a public note:

```zsh
new-note -p "Project Ideas"
```

## Script

In this example, your Obsidian vault is called `my-vault`, your notes folder is called `notes`, and your private notes folder is called `private-notes`.

The script does the following:

- Converts your title to a filename (spaces become hyphens, words become lowercase)
- Creates a markdown file with YAML frontmatter
- Places notes in `private-notes/`  by default, and public notes in `notes/`
- Automatically opens the new note in Obsidian

The folder defaults to the private folder because I figured it was better to accidentally make a public note private than the other way around.

```bash
#!/bin/zsh

# Check if the public flag is set
# Set to private by default
public=false
if [ "$1" = "-p" ]; then
	public=true
	shift # Remove -p from arguments
fi

# Check if note title was provided
if [ -z "$1" ]; then
	echo "Usage: new-note [-p] 'Note Title'"
	exit 1
fi

# Get the note title and create filename
note_name="$1"
file_name="${1// /-}" # Replace spaces with hyphens
file_name=$(echo "$file_name" | tr '[:upper:]' '[:lower:]') # Convert to lowercase

# Set folder and vault path based on public flag
if [ "$public" = true ]; then
	folder="$HOME/my-vault/notes/"
	vault_path="notes/$file_name.md"
else
	folder="$HOME/my-vault/private-notes/"
	vault_path="private-notes/$file_name.md"
fi

# Check if file already exists
if [ -f "$folder/$file_name.md" ]; then
   # Print the error message in red
	echo "\033[1;31mError: A note with that title already exists\033[0m" 
	exit 1
fi

# Get current date
date=$(date +%F)

# Create the markdown file with YAML frontmatter
cat <<EOF > "$folder/$file_name.md"
---
title: $note_name
tags:
created: $date
updated: $date
---
EOF

# Open the new note in Obsidian
open "obsidian://open?vault=my-vault&file=$vault_path"
```
