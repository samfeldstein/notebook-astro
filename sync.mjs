#!/usr/bin/env node
/*
  sync.mjs: writes the parts every page shares, and the sitemap.

  Each file in the shared folder (default: shared/) is one block. A page opts
  in by wrapping a copy of it in marker comments named after the file:

    <!-- shared:header --> ... <!-- /shared:header -->     (from shared/header.html)
    <!-- shared:footer --> ... <!-- /shared:footer -->     (from shared/footer.html)

  This script rewrites what is between the markers. Edit the shared file,
  never the text between the markers. A link in a shared block that points at
  the current page gets aria-current="page".

  If site.config.json sets "siteUrl", it also writes sitemap.xml in the site
  root, listing every page except those in "noSitemap" and those marked
  <meta name="robots" content="noindex">.

  With "built": true (pages come from a build such as Astro) it writes
  nothing. Pages in "skipPages" are left alone.

  Usage:
    node sync.mjs           write changes
    node sync.mjs --check   write nothing; exit 1 if anything is out of date

  Settings (all optional) are read from site.config.json next to this script;
  see references/drift-scripts.md in the skill.
*/
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export function loadConfig(dir = here) {
  const file = join(dir, "site.config.json");
  const user = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  const config = { root: ".", shared: "shared", siteUrl: "", noSitemap: ["404.html"], skipPages: [], facts: {}, ...user };
  config.configDir = resolve(dir);
  config.rootDir = resolve(dir, config.root);
  config.sharedDir = resolve(dir, config.shared);
  config.siteUrl = config.siteUrl.replace(/\/+$/, "");
  return config;
}

/** True if a page (path relative to the root) is in "skipPages": an exact path, or a folder ending in "/". */
export const isSkipped = (rel, config) => (config.skipPages ?? []).some((s) => (s.endsWith("/") ? rel.startsWith(s) : rel === s));

/** Every .html page under the root, as { file, rel, path }. Skips the shared folder, dot folders, node_modules and "skipPages". */
export function listPages(config) {
  const pages = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name.startsWith(".") || name === "node_modules" || full === config.sharedDir) continue;
        walk(full);
      } else if (name.endsWith(".html")) {
        const rel = relative(config.rootDir, full).split(sep).join("/");
        if (isSkipped(rel, config)) continue;
        const path = rel === "index.html" ? "/" : rel.endsWith("/index.html") ? "/" + rel.slice(0, -"index.html".length) : "/" + rel;
        pages.push({ file: full, rel, path });
      }
    }
  };
  walk(config.rootDir);
  return pages;
}

export function sharedBlocks(config) {
  if (!existsSync(config.sharedDir)) return {};
  const blocks = {};
  for (const name of readdirSync(config.sharedDir).sort()) {
    if (name.endsWith(".html")) blocks[name.slice(0, -5)] = readFileSync(join(config.sharedDir, name), "utf8").replace(/\s+$/, "");
  }
  return blocks;
}

const samePath = (a, b) => (a.replace(/index\.html$/, "").replace(/\/+$/, "") || "/") === (b.replace(/index\.html$/, "").replace(/\/+$/, "") || "/");

function markCurrent(block, path) {
  return block.replace(/<a\b([^>]*?)\bhref="([^"]+)"([^>]*)>/g, (tag, before, href, after) => {
    if (/aria-current/.test(tag) || !href.startsWith("/") || !samePath(href.split(/[?#]/)[0], path)) return tag;
    return `<a${before}href="${href}"${after} aria-current="page">`;
  });
}

/** The page's HTML with every shared block rewritten. */
export function syncPage(html, page, blocks) {
  return html.replace(/(<!-- shared:([\w-]+) -->)[\s\S]*?(<!-- \/shared:\2 -->)/g, (whole, open, name, close) => {
    if (!(name in blocks)) throw new Error(`${page.rel}: no shared/${name}.html for the shared:${name} marker`);
    return `${open}\n${markCurrent(blocks[name], page.path)}\n${close}`;
  });
}

export function isNoindex(html) {
  return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
    /<meta\b[^>]*content=["'][^"']*noindex[^>]*name=["']robots["']/i.test(html);
}

export function sitemapPages(pages, config, htmlOf) {
  return pages.filter((p) => !config.noSitemap.includes(p.rel) && !isNoindex(htmlOf(p)));
}

export function buildSitemap(pages, config) {
  const urls = [...pages].sort((a, b) => a.path.localeCompare(b.path)).map((p) => `  <url><loc>${config.siteUrl}${p.path}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Returns the files that are (or would be) changed. */
export function sync(config, { write = true } = {}) {
  if (config.built) return [];
  const blocks = sharedBlocks(config);
  const pages = listPages(config);
  const changed = [];
  const html = new Map();
  for (const page of pages) {
    const before = readFileSync(page.file, "utf8");
    const after = syncPage(before, page, blocks);
    html.set(page.file, after);
    if (after !== before) {
      changed.push(page.rel);
      if (write) writeFileSync(page.file, after);
    }
  }
  if (config.siteUrl) {
    const file = join(config.rootDir, "sitemap.xml");
    const xml = buildSitemap(sitemapPages(pages, config, (p) => html.get(p.file)), config);
    if (!existsSync(file) || readFileSync(file, "utf8") !== xml) {
      changed.push("sitemap.xml");
      if (write) writeFileSync(file, xml);
    }
  }
  return changed;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const check = process.argv.includes("--check");
  try {
    const config = loadConfig();
    const changed = sync(config, { write: !check });
    if (config.built) console.log('sync: "built" is set, so the build writes the pages; nothing to do');
    else if (!changed.length) console.log("sync: everything up to date");
    else if (check) {
      console.error(`sync: out of date (run node sync.mjs):\n  ${changed.join("\n  ")}`);
      process.exit(1);
    } else console.log(`sync: updated\n  ${changed.join("\n  ")}`);
  } catch (e) {
    console.error(`sync: ${e.message}`);
    process.exit(1);
  }
}
