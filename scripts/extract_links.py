from pathlib import Path
import re

NOTES_DIR = Path("src/content/notes")


def extract_links(content):
    links = []

    markdown_links = re.findall(
        r"\[([^\]]+)\]\(([^)]+)\)",
        content
    )

    for title, url in markdown_links:
        links.append({
            "title": title,
            "url": url,
            "type": "external" if url.startswith("http") else "internal",
        })

    wiki_links = re.findall(
        r"\[\[([^\]]+)\]\]",
        content
    )

    for link in wiki_links:
        parts = link.split("|")

        target = parts[0].strip()
        title = parts[1].strip() if len(parts) > 1 else target

        url = "/" + target.replace(".md", "").replace(" ", "-").lower()

        links.append({
            "title": title,
            "url": url,
            "type": "internal",
        })

    return links


def add_links_to_frontmatter(path):
    text = path.read_text()

    match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)

    if not match:
        return

    frontmatter = match.group(1)
    body = text[match.end():]

    links = extract_links(body)

    if not links:
        return

    # remove existing links block if it exists
    frontmatter = re.sub(
        r"\nlinks:\n(?:  .*\n?)*",
        "",
        frontmatter
    )

    links_yaml = "links:\n"

    for link in links:
      links_yaml += f"  - title: {link['title']}\n"
      links_yaml += f"    url: {link['url']}\n"
      links_yaml += f"    type: {link['type']}\n"

    new_frontmatter = (
        "---\n"
        + frontmatter.rstrip()
        + "\n"
        + links_yaml
        + "---"
    )

    path.write_text(new_frontmatter + body)


# for path in NOTES_DIR.rglob("*.md"):
#     add_links_to_frontmatter(path)
#     print(f"Updated {path}")

TEST_NOTE = Path("src/content/notes/astro-resources.md")

for path in [TEST_NOTE]:
    add_links_to_frontmatter(path)
    print(f"Updated {path}")