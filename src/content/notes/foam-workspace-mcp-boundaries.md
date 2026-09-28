---
title: Foam Workspace MCP Boundaries
private: false
created: 2026-09-25
updated: 2026-09-25
tags: [Foam]
---

## Purpose

Foam MCP can give AI agents access to notes in an Obsidian/Markdown workspace. To keep sensitive material inaccessible to the AI agent, use the MCP workspace path as the access boundary.

## Configuration

The [Foam MCP server](https://docs.foam.md/tools/cli/mcp/#connecting-an-ai-client) is configured in Claude Desktop with a specific workspace:

```json
{
  "mcpServers": {
    "foam": {
      "command": "npx",
      "args": [
        "foam-cli",
        "mcp",
        "--workspace",
        "/path/to/your/notes"
      ]
    }
  }
}
```

This means Foam MCP can access files within `/path/to/your/notes`, but not files elsewhere in the project.

## Testing the Boundary

A test note was created at:

`/path/to/your/notes/ai-hidden/mcp-exclusion-test.md`

VS Code Foam was configured with:

```json
"foam.files.include": ["/path/to/your/notes/**"],
"foam.files.exclude": ["/path/to/your/notes/ai-hidden/**"]
```

The note disappeared from the Foam graph, indicating that the VS Code Foam extension respected the exclusion.

However, Foam MCP was still able to find the note. Searching by both its unique content and filename succeeded. Therefore, `foam.files.exclude` does **not** provide an MCP access boundary.

A second test placed a note outside `/path/to/your/notes/`. Foam MCP was unable to find that note. This confirmed that the `--workspace` path does provide an effective boundary.

## Practical Organization

Use two separate mechanisms for two separate purposes:

* **File location:** controls whether Foam MCP can access a note.
* **`private: true`:** controls whether a note is published by the Astro notebook site.

Therefore, genuinely sensitive information—such as passwords, API keys, recovery codes, or other secrets—should be stored **outside the Foam MCP workspace**.

Ordinary notes that should remain unpublished can continue using `private: true` inside the notebook. They will still be accessible to Foam MCP, but will not be published by the website.

## Conclusion

The MCP workspace itself is the reliable access boundary. There is no need to maintain a filtered copy of the notebook or regenerate an AI-specific workspace whenever a note is added.

The important distinction is:

> **`private` controls web publication; workspace location controls AI access.**
