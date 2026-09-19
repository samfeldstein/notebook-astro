import fs from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.READWISE_TOKEN;
const OUT = './src/content/notes/private/readwise';
const STATE = './.readwise-last-sync';

if (!TOKEN) throw new Error('READWISE_TOKEN is not set');

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

let updatedAfter;
try { updatedAfter = (await fs.readFile(STATE, 'utf8')).trim(); } catch { }

const DAY = 24 * 60 * 60 * 1000;
if (
  updatedAfter &&
  !process.argv.includes('--force') &&
  Date.now() - new Date(updatedAfter) < DAY
) {
  console.log('Readwise synced within the last 24h, skipping (use --force to override).');
  process.exit(0);
}

const startedAt = new Date().toISOString();
await fs.mkdir(OUT, { recursive: true });

async function* fetchBooks(params = {}) {
  let cursor;
  for (; ;) {
    const url = new URL('https://readwise.io/api/v2/export/');
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    if (cursor) url.searchParams.set('pageCursor', cursor);

    const res = await fetch(url, { headers: { Authorization: `Token ${TOKEN}` } });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, (+res.headers.get('Retry-After') || 30) * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`Readwise ${res.status}`);

    const data = await res.json();
    yield* data.results;
    cursor = data.nextPageCursor;
    if (!cursor) break;
  }
}

async function writeBook(book) {
  const body = book.highlights
    .map((h) => `> ${h.text.replace(/\n/g, '\n> ')}\n${h.note ? `\n${h.note}\n` : ''}`)
    .join('\n');

  const lines = [
    '---',
    `title: ${JSON.stringify(book.title)}`,
    book.author ? `author: ${JSON.stringify(book.author)}` : null,
    `category: ${JSON.stringify(book.category)}`,
    book.source_url ? `source_url: ${JSON.stringify(book.source_url)}` : null,
    book.readwise_url ? `readwise_url: ${JSON.stringify(book.readwise_url)}` : null,
    'private: true',
    '---',
    '',
    body,
    '',
  ].filter((l) => l !== null);

  const name = slug(book.title) || String(book.user_book_id);
  await fs.writeFile(path.join(OUT, `${name}.md`), lines.join('\n'));
}

if (!updatedAfter) {
  // First run: everything comes back complete.
  for await (const book of fetchBooks()) await writeBook(book);
} else {
  // Later runs: find changed books, then refetch each in full.
  const changed = [];
  for await (const book of fetchBooks({ updatedAfter })) changed.push(book.user_book_id);

  for (let i = 0; i < changed.length; i += 50) {
    const ids = changed.slice(i, i + 50).join(',');
    for await (const book of fetchBooks({ ids })) await writeBook(book);
  }
}

await fs.writeFile(STATE, startedAt);