---
title: Anki Issues
created: 2026-10-03
updated: 2026-10-03
---

## Anki Issues

### Symptoms

- **Cursor jumping:** The cursor will randomly jump around while I'm typing. I've noticed this inside cloze deletion blocks and while editing HTML.
- **HTML editing:** When typing a tag—in one case, `<code>`—Anki automatically inserted what looked like a `body` tag or attribute. Continuing to type caused additional `<code>` tags to appear repeatedly, making the HTML unusable.
- **Add window focus:** When I press `A` to add a new card, the first field is not automatically focused. I believe it used to be.

### Hypotheses

- The cursor jumping may be related to code syntax, cloze deletion blocks, or HTML.
- I discovered that I had the experimental **Svelte Note Editor** enabled. This may be responsible for some or all of the editor problems.

### Troubleshooting

- Disabled the experimental **Svelte Note Editor**.
- Changed the video driver to **Default**. I believe I've changed this setting before to resolve another Anki issue, but I couldn't find any documentation in my notes. Metal was previously selected.
- Enabled **Reduced Motion**.
- Enabled **Minimalist Mode**.

## Conclusion

Svelte was problem.
