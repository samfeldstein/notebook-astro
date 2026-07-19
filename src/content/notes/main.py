#!/usr/bin/env python3

from pathlib import Path

for file in Path(".").glob("*"):
    if file.suffix not in {".md", ".mdx"}:
        continue

    content = file.read_text()

    # Skip files that already have private set
    if "private:" in content:
        continue

    # Add private: false above created:
    updated = content.replace(
        "created:",
        "private: false\ncreated:",
        1
    )

    if updated != content:
        file.write_text(updated)
        print(f"Updated {file}")