import fs from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.READWISE_TOKEN;
const OUT = './src/content/notes/private/_readwise';
const STATE = './.readwise-last-sync';

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

let updatedAfter;
try { updatedAfter = (await fs.readFile(STATE, 'utf8')).trim(); } catch { }

const startedAt = new Date().toISOString();
await fs.mkdir(OUT, { recursive: true });

let cursor;
do {
  const url = new URL('https://readwise.io/api/v2/export/');
  if (cursor) url.searchParams.set('pageCursor', cursor);
  if (updatedAfter) url.searchParams.set('updatedAfter', updatedAfter);

  const res = await fetch(url, { headers: { Authorization: `Token ${TOKEN}` } });
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, (+res.headers.get('Retry-After') || 30) * 1000));
    continue;
  }
  if (!res.ok) throw new Error(`Readwise ${res.status}`);
  const data = await res.json();

  for (const book of data.results) {
    const body = book.highlights
      .map((h) => `> ${h.text.replace(/\n/g, '\n> ')}\n${h.note ? `\n${h.note}\n` : ''}`)
      .join('\n');
    const md = `---
title: "${book.title.replace(/"/g, '\\"')}"
author: "${(book.author ?? '').replace(/"/g, '\\"')}"
category: ${book.category}
source_url: ${book.source_url ?? ''}
readwise_url: ${book.readwise_url}
---

${body}
`;
    await fs.writeFile(path.join(OUT, `${slug(book.title)}.md`), md);
  }
  cursor = data.nextPageCursor;
} while (cursor);

await fs.writeFile(STATE, startedAt);