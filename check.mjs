#!/usr/bin/env node
/*
  check.mjs: fails if the site has drifted or something is broken.

  It always checks that:
    - the shared blocks and the sitemap are up to date (as sync.mjs would write them)
    - every page has <html lang>, a <title>, a meta description and exactly one <h1>
    - every page has a canonical URL matching its address, when "siteUrl" is set
      (pages in "noSitemap" or marked noindex are exempt)
    - every internal href, src, srcset, poster and form action, and the
      og:image, og:url and twitter:image tags, point at a file that exists
      (a full URL on "siteUrl" counts as internal)
    - for, popovertarget, list, headers and the aria-* id references name ids
      that exist on the same page, and so does every href="#id"
    - each Sitemap: line in robots.txt points at a file that exists
    - the sitemap lists exactly the pages that should be indexed
    - each key fact in "facts" reads the same everywhere it appears

  With these site.config.json keys it also checks (see
  references/drift-scripts.md in the skill):
    - "moduleScripts": true: every <script src> is type="module", and every
      classic inline script runs inside a self-calling function
    - "allowedHosts": [...]: no script, stylesheet, image, media, iframe,
      embed, object or form loads from a host outside the list (the siteUrl
      host is always allowed; plain <a> links are fine), and no such host
      appears in the site's JS or in url() or @import in its CSS
    - "contrast": { "file", "pairs" }: text and background color pairs meet
      their WCAG minimum, read from the custom properties in that CSS file
    - "sizeBudgetKB": { "default", "/path/" }: each page's gzipped HTML plus the
      same-site CSS and JS it links stays within its budget

  Other keys:
    - "built": true: the root is a build's output (Astro and similar), so
      there is no sync step to check
    - "skipPages": [...]: pages not checked at all (a CMS admin app, or a
      folder ending in "/" that is built locally but never deployed)
    - "known": [{ "page", "match", "why" }]: a failure on that exact page (or
      in that folder, if "page" ends in "/", for pages a CMS adds) whose
      message matches the regular expression becomes a warning with the
      note, printed on every run; an entry that matches nothing warns
    - "clientCms": true: the client's CMS saves deploy the site, so the check
      must never run in the host's build (a failure would stop the client's
      edit from going live). It fails if netlify.toml, wrangler's build
      command, or the package.json build scripts run it, and inside a host
      build (NETLIFY, WORKERS_CI or CF_PAGES set) it warns and passes
      without checking.

  It warns, without failing, about contrast pairs marked "known" and about
  open lines in docs/checks-log.md.

  Usage:
    node check.mjs           run every check
    node check.mjs --facts   also list where each fact appears

  Settings come from site.config.json next to this script. Keep this file
  next to sync.mjs.
*/
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { isNoindex, listPages, loadConfig, sitemapPages, sync } from "./sync.mjs";

// Attribute values may contain ">", so a tag runs to the first ">" outside quotes.
const ATTRS = `((?:"[^"]*"|'[^']*'|[^'">])*)`;

const stripNoise = (html) =>
  html.replace(/<!--[\s\S]*?-->/g, "").replace(new RegExp(`<(script|style)\\b${ATTRS}>[\\s\\S]*?<\\/\\1>`, "gi"), (m, tag, attrs) => `<${tag}${attrs}></${tag}>`);

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b${ATTRS}>`, "gi"))].map((m) => attrs(m[1]));
}

/** Every opening tag, as { name, a }. */
const allTags = (html) => [...html.matchAll(new RegExp(`<([a-zA-Z][\\w-]*)\\b${ATTRS}>`, "g"))].map((m) => ({ name: m[1].toLowerCase(), a: attrs(m[2]) }));

const textOf = (html) =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#36;|&dollar;/g, "$").replace(/\s+/g, " ");

const hostOf = (url) => /^(?:https?:)?\/\/(?:[^/?#@\s]*@)?([^/?#:\s]+)/i.exec(url.trim())?.[1].toLowerCase() ?? null;

/** A full URL on the siteUrl host (either scheme, any case) becomes a root-relative one; anything else is returned as is. */
function toLocal(url, config) {
  const u = url.trim();
  if (!config.siteUrl || !/^(?:https?:)?\/\//i.test(u) || hostOf(u) !== hostOf(config.siteUrl)) return u;
  try {
    const parsed = new URL(u, config.siteUrl);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return u;
  }
}

function isInternal(url) {
  return url && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url.trim());
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** The file an internal URL points at, or null if none exists. */
function resolveUrl(url, page, config) {
  const clean = safeDecode(url.trim().split(/[?#]/)[0]);
  if (!clean) return page.file;
  const base = clean.startsWith("/") ? config.rootDir : dirname(page.file);
  let target = normalize(join(base, clean.startsWith("/") ? clean.slice(1) : clean));
  if (!target.startsWith(config.rootDir)) return null;
  if (clean.endsWith("/") || (existsSync(target) && statSync(target).isDirectory())) target = join(target, "index.html");
  else if (!existsSync(target) && existsSync(target + ".html")) target += ".html";
  return existsSync(target) ? target : null;
}

/**
 * A classic inline script shares its top-level names with every other script,
 * so it must declare nothing at the top level: wrap it in (() => { ... })();.
 * Scans outside strings, comments and brackets for var, let, const, function and class.
 */
export function scriptProblems(code) {
  const names = [];
  let depth = 0;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1];
    if (ch === "/" && next === "/") i = code.indexOf("\n", i) === -1 ? code.length : code.indexOf("\n", i);
    else if (ch === "/" && next === "*") i = code.indexOf("*/", i + 2) === -1 ? code.length : code.indexOf("*/", i + 2) + 1;
    else if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== ch) j += code[j] === "\\" ? 2 : 1;
      i = j;
    } else if ("({[".includes(ch)) depth++;
    else if (")}]".includes(ch)) depth--;
    else if (depth === 0 && /[a-z]/i.test(ch) && !/[\w$.]/.test(code[i - 1] ?? "")) {
      const word = /^[A-Za-z_$][\w$]*/.exec(code.slice(i))[0];
      // "function" or "class" after an operator is an expression (!function(){}()), not a declaration.
      const before = code.slice(0, i).trimEnd().slice(-1);
      if (/^(var|let|const)$/.test(word) || (/^(function|class)$/.test(word) && !/[!~+\-=(,:?&|]/.test(before))) names.push(word);
      i += word.length - 1;
    }
  }
  return names.length ? [`script declares ${[...new Set(names)].join(", ")} at the top level; wrap it in a function that runs itself, e.g. (() => { ... })();`] : [];
}

/** Any absolute http(s) or protocol-relative address in code must be on the allowed-hosts list (no third-party services). */
export function hostProblems(text, allowed) {
  const problems = [];
  const host = String.raw`([a-z0-9.-]+\.[a-z]{2,}|localhost|\d{1,3}(?:\.\d{1,3}){3})`;
  for (const m of text.matchAll(new RegExp(String.raw`(?:https?:\/\/|(?<=["'\x60(=])\/\/)(?:[^\s/?#@"'\x60]*@)?${host}`, "gi"))) {
    const host = m[1].toLowerCase();
    if (!allowed.includes(host)) problems.push(`refers to ${host}, which isn't in site.config.json "allowedHosts"`);
  }
  return [...new Set(problems)];
}

// ---- Colors: parse CSS colors to gamma-encoded sRGB (0..1) plus alpha ----

const NAMED = { white: [1, 1, 1], black: [0, 0, 0] };

const encode = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const decode = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const clamp = (v) => Math.min(1, Math.max(0, v));

function num(s, percentOf = 1) {
  s = s.trim();
  if (s === "none") return 0;
  if (s.endsWith("%")) return (parseFloat(s) / 100) * percentOf;
  if (s.endsWith("deg")) return parseFloat(s);
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error(`can't read "${s}"`);
  return n;
}

function oklchToRgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  // Out-of-gamut colors are clipped to sRGB.
  return lin.map((v) => encode(clamp(v)));
}

/** Parse one literal CSS color, or return null. */
export function parseColor(value) {
  const v = value.trim().toLowerCase();
  if (NAMED[v]) return { rgb: NAMED[v], alpha: 1 };
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
    const n = [0, 2, 4, 6].map((i) => (i < hex.length ? parseInt(hex.slice(i, i + 2), 16) / 255 : 1));
    return { rgb: n.slice(0, 3), alpha: n[3] };
  }
  m = /^(rgba?|oklch)\(([^)]*)\)$/.exec(v);
  if (!m) return null;
  const [main, alphaPart] = m[2].split("/");
  const parts = main.split(/[\s,]+/).filter(Boolean);
  let alpha = alphaPart !== undefined ? num(alphaPart) : 1;
  if (m[1].startsWith("rgb")) {
    if (parts.length === 4) alpha = num(parts.pop());
    if (parts.length !== 3) return null;
    return { rgb: parts.map((p) => clamp(num(p, 255) / 255)), alpha };
  }
  if (parts.length !== 3) return null;
  return { rgb: oklchToRgb(num(parts[0], 1), num(parts[1], 0.4), num(parts[2])), alpha };
}

/** Resolve a custom property (following var()) or a literal color. */
function resolveColor(css, value, seen = new Set()) {
  const ref = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value.trim());
  const name = ref ? ref[1] : value.trim().startsWith("--") ? value.trim() : null;
  if (!name) return parseColor(value);
  if (seen.has(name)) return null;
  seen.add(name);
  const escaped = name.replace(/[-]/g, "\\-");
  const m = new RegExp(`(?:^|[\\s;{])${escaped}\\s*:\\s*([^;}]+)`).exec(css);
  return m ? resolveColor(css, m[1].replace(/!important\s*$/i, ""), seen) : null;
}

const luminance = (rgb) => {
  const [r, g, b] = rgb.map(decode);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Blend a color with alpha over an opaque one (in sRGB, as browsers do). */
const over = (top, bottom) => top.rgb.map((c, i) => top.alpha * c + (1 - top.alpha) * bottom[i]);

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Check contrast pairs; returns { problems, warnings }. */
export function contrastProblems(cssText, pairs) {
  const css = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const problems = [];
  const warnings = [];
  for (const pair of pairs) {
    const { fg, bg, min = 4.5, known } = pair;
    const label = `contrast ${fg} on ${bg}${pair.over ? ` over ${pair.over}` : ""}`;
    let f, b, base;
    try {
      f = resolveColor(css, fg);
      b = resolveColor(css, bg);
      base = pair.over ? resolveColor(css, pair.over) : null;
    } catch (e) {
      problems.push(`${label}: ${e.message}`);
      continue;
    }
    const missing = [[f, fg], [b, bg], ...(pair.over ? [[base, pair.over]] : [])].find(([c]) => !c);
    if (missing) {
      problems.push(`${label}: can't resolve ${missing[1]} to a color`);
      continue;
    }
    if (b.alpha < 1 && (!base || base.alpha < 1)) {
      problems.push(`${label}: ${bg} is see-through; add "over" with the opaque color behind it`);
      continue;
    }
    const bgRgb = b.alpha < 1 ? over(b, base.rgb) : b.rgb;
    const fgRgb = f.alpha < 1 ? over(f, bgRgb) : f.rgb;
    const ratio = contrastRatio(fgRgb, bgRgb);
    const text = `${label} is ${ratio.toFixed(2)}:1`;
    if (ratio < min) (known ? warnings : problems).push(`${text}, below ${min}:1${known ? ` (known: ${known})` : ""}`);
    else if (known) warnings.push(`${text}, which now meets ${min}:1; remove its "known" note`);
  }
  return { problems, warnings };
}

const ID_REFERENCES = ["for", "aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-activedescendant", "aria-errormessage", "popovertarget", "list", "headers"];

/** Every .js file under a folder, recursively. */
function jsFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name.startsWith(".") || name === "node_modules" ? [] : jsFiles(full);
    return name.endsWith(".js") || name.endsWith(".mjs") ? [full] : [];
  });
}

/**
 * Moves failures listed in "known" (an exact page, or a folder ending in "/" for pages a CMS adds; a regex on the message) to warnings.
 * Returns the failures that remain. Entries that match nothing, or lack a page or match, are reported too.
 */
export function applyKnown(problems, known, warn) {
  const kept = [];
  const used = new Set();
  const entries = known.filter((k, i) => {
    if (typeof k.page === "string" && typeof k.match === "string" && k.page && k.match) return true;
    kept.push(`site.config.json: "known" entry ${i + 1} needs a "page" and a "match"`);
    return false;
  });
  for (const line of problems) {
    const cut = line.indexOf(": ");
    const [where, message] = [line.slice(0, cut), line.slice(cut + 2)];
    const k = entries.find((e) => (e.page.endsWith("/") ? where.startsWith(e.page) : where === e.page) && new RegExp(e.match).test(message));
    if (!k) kept.push(line);
    else {
      used.add(k);
      warn(`known${k.why ? ` (${k.why})` : ""}: ${line}`);
    }
  }
  for (const e of entries) if (!used.has(e)) warn(`"known" entry for ${e.page} (${e.match}) matches nothing; remove it`);
  return kept;
}

/** Places in the repo where a host build would run the check: a clientCms site must have none. */
export function buildCommandProblems(dir) {
  const gate = /check\.mjs|node\s+--test|npm\s+(?:run\s+)?test\b/;
  const found = [];
  const read = (name) => (existsSync(join(dir, name)) ? readFileSync(join(dir, name), "utf8") : null);
  const toml = read("netlify.toml");
  if (toml) for (const m of toml.matchAll(/^\s*command\s*=\s*(["'])(.*?)\1/gm)) if (gate.test(m[2])) found.push(`netlify.toml command "${m[2]}"`);
  for (const name of ["wrangler.jsonc", "wrangler.json", "wrangler.toml"]) {
    const text = read(name);
    if (text) for (const m of text.matchAll(/["']?command["']?\s*[:=]\s*(["'])(.*?)\1/g)) if (gate.test(m[2])) found.push(`${name} build command "${m[2]}"`);
  }
  const pkg = read("package.json");
  if (pkg) {
    const scripts = JSON.parse(pkg).scripts ?? {};
    for (const name of ["prebuild", "build", "postbuild"]) if (gate.test(scripts[name] ?? "")) found.push(`package.json "${name}" script "${scripts[name]}"`);
  }
  return found.map((f) => `${f} runs the check in the host build, which could stop the client's CMS saves from going live; run it only in the pre-push hook`);
}

/** True inside a Netlify or Cloudflare build. Plain CI isn't counted, so a stray CI=true in a local shell can't switch the hook off. */
export const inHostBuild = (env = process.env) => ["NETLIFY", "WORKERS_CI", "CF_PAGES"].some((v) => env[v] && !/^(?:false|0)$/i.test(env[v]));

/** Open lines ("- [ ]") in <dir>/docs/checks-log.md, outside fenced code blocks, or 0. */
export function openChecks(dir) {
  const file = join(dir, "docs", "checks-log.md");
  if (!existsSync(file)) return 0;
  const text = readFileSync(file, "utf8").replace(/^```[\s\S]*?^```/gm, "");
  return (text.match(/^\s*- \[ \]/gm) ?? []).length;
}

export function check(config, { listFacts = false, warnings } = {}) {
  const problems = [];
  const fail = (where, msg) => problems.push(`${where}: ${msg}`);
  const warn = warnings ? (msg) => warnings.push(msg) : (msg) => console.warn(`check: warning: ${msg}`);

  try {
    for (const file of sync(config, { write: false })) fail(file, "out of date; run node sync.mjs");
  } catch (e) {
    fail("sync", e.message);
  }

  const pages = listPages(config);
  const raw = new Map(pages.map((p) => [p.file, readFileSync(p.file, "utf8")]));
  const occurrences = Object.fromEntries(Object.keys(config.facts).map((k) => [k, []]));
  const siteHost = config.siteUrl ? hostOf(config.siteUrl) : null;
  const allowed = config.allowedHosts ? [...config.allowedHosts.map((h) => h.toLowerCase()), ...(siteHost ? [siteHost] : [])] : null;
  const loadedJs = new Set();
  const loadedCss = new Set();

  for (const page of pages) {
    const html = raw.get(page.file);
    const clean = stripNoise(html);
    const indexed = !config.noSitemap.includes(page.rel) && !isNoindex(html);
    const all = allTags(clean);

    if (!/<html\b[^>]*\blang=["']?[\w-]+/i.test(clean)) fail(page.rel, "missing <html lang>");
    const title = clean.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (!title || !title[1].trim()) fail(page.rel, "missing <title>");
    const description = tags(clean, "meta").find((a) => a.name?.toLowerCase() === "description");
    if (!description?.content?.trim()) fail(page.rel, "missing meta description");
    const h1s = (clean.match(/<h1\b/gi) ?? []).length;
    if (h1s !== 1) fail(page.rel, `has ${h1s} <h1> elements, needs exactly 1`);

    if (config.siteUrl && indexed) {
      const canonical = tags(clean, "link").find((a) => (a.rel ?? "").toLowerCase().split(/\s+/).includes("canonical"));
      const expected = config.siteUrl + page.path;
      if (!canonical) fail(page.rel, `missing canonical link (expected ${expected})`);
      else if (canonical.href !== expected && safeDecode(canonical.href) !== expected) fail(page.rel, `canonical is ${canonical.href}, expected ${expected}`);
    }

    // Links and assets
    const urls = [];
    for (const [tag, attr] of [["a", "href"], ["link", "href"], ["script", "src"], ["img", "src"], ["source", "src"], ["video", "src"], ["video", "poster"], ["audio", "src"], ["iframe", "src"], ["embed", "src"], ["track", "src"], ["input", "src"], ["object", "data"], ["form", "action"]]) {
      for (const a of tags(clean, tag)) if (a[attr] !== undefined) urls.push([`<${tag} ${attr}>`, a[attr], tag]);
    }
    for (const tag of ["img", "source"]) {
      for (const a of tags(clean, tag)) {
        // Each candidate is a URL (no spaces; a data: URI may hold commas), then an optional descriptor.
        for (const m of (a.srcset ?? "").matchAll(/\s*([^\s,][^\s]*)(?:\s+[^,]*)?(?:,|$)/g)) {
          const url = m[1].replace(/,+$/, "");
          if (url) urls.push([`<${tag} srcset>`, url, tag]);
        }
      }
    }
    for (const a of tags(clean, "meta")) {
      const key = (a.property ?? a.name ?? "").toLowerCase();
      if (/^(og:image|og:url|twitter:image)$/.test(key) && a.content) urls.push([`<meta ${key}>`, a.content, "meta"]);
    }
    for (const [label, url] of urls) {
      const local = toLocal(url, config);
      if (isInternal(local) && !resolveUrl(local, page, config)) fail(page.rel, `${label} points at a missing file: ${url}`);
    }

    // id references
    const ids = new Set(all.map((t) => t.a.id).filter((id) => id !== undefined));
    for (const t of all) {
      for (const attr of ID_REFERENCES) {
        for (const id of (t.a[attr] ?? "").split(/\s+/).filter(Boolean)) {
          if (!ids.has(id)) fail(page.rel, `<${t.name} ${attr}="${id}"> names an id that doesn't exist on this page`);
        }
      }
      const href = t.name === "a" ? t.a.href?.trim() : undefined;
      if (href?.startsWith("#") && href.length > 1 && href !== "#top" && !ids.has(safeDecode(href.slice(1)))) fail(page.rel, `<a href="${href}"> points at an id that doesn't exist on this page`);
    }

    // Scripts
    const scripts = [...html.replace(/<!--[\s\S]*?-->/g, "").matchAll(new RegExp(`<script\\b${ATTRS}>([\\s\\S]*?)<\\/script>`, "gi"))].map((m) => ({ a: attrs(m[1]), body: m[2] }));
    for (const { a, body } of scripts) {
      const type = a.type?.trim().toLowerCase();
      if (a.src !== undefined) {
        const local = toLocal(a.src, config);
        const file = isInternal(local) && resolveUrl(local, page, config);
        if (file) loadedJs.add(file);
        if (config.moduleScripts && type !== "module") fail(page.rel, `<script src="${a.src}"> isn't type="module", so its top-level names are shared with every other script`);
      } else if ((!type || /javascript|module/.test(type)) && body.trim()) {
        if (config.moduleScripts && type !== "module") for (const p of scriptProblems(body)) fail(page.rel, `inline <script>: ${p}`);
        if (allowed) for (const p of hostProblems(body, allowed)) fail(page.rel, `inline <script>: ${p}`);
      }
    }

    // Hosts: anything the page loads (not plain links)
    if (allowed) {
      for (const [label, url, tag] of urls) {
        if (tag === "a" || tag === "meta") continue;
        const host = hostOf(url);
        if (host && !allowed.includes(host)) fail(page.rel, `${label} loads from ${host}, which isn't in site.config.json "allowedHosts"`);
      }
      // CSS: url() and @import in inline <style> and style attributes, and the stylesheets the page links
      const inlineCss = [...html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
      for (const t of all) if (t.a.style) inlineCss.push(t.a.style);
      for (const p of hostProblems(inlineCss.join("\n"), allowed)) fail(page.rel, `inline CSS: ${p}`);
      for (const a of tags(clean, "link")) {
        if (!(a.rel ?? "").toLowerCase().split(/\s+/).includes("stylesheet") || !a.href) continue;
        const local = toLocal(a.href, config);
        const file = isInternal(local) && resolveUrl(local, page, config);
        if (file) loadedCss.add(file);
      }
    }

    const text = textOf(clean) + " " + [...html.matchAll(/<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(" ");
    for (const [name, fact] of Object.entries(config.facts)) {
      for (const m of text.matchAll(new RegExp(fact.pattern, "g"))) {
        occurrences[name].push({ page: page.rel, found: m[0] });
        if (m[0] !== fact.value) fail(page.rel, `fact "${name}" reads "${m[0]}", expected "${fact.value}"`);
      }
    }

    // Size budget
    const budgets = config.sizeBudgetKB;
    const limitKB = budgets?.[page.path] ?? budgets?.default;
    if (limitKB) {
      const gz = (buf) => gzipSync(buf, { level: 9 }).length;
      let total = gz(Buffer.from(html));
      const files = new Set();
      for (const a of tags(clean, "link")) if ((a.rel ?? "").toLowerCase().split(/\s+/).includes("stylesheet") && a.href) files.add(a.href);
      for (const { a } of scripts) if (a.src) files.add(a.src);
      for (const url of files) {
        const local = toLocal(url, config);
        const file = isInternal(local) && resolveUrl(local, page, config);
        if (file) total += gz(readFileSync(file));
      }
      if (total > limitKB * 1024) fail(page.rel, `${(total / 1024).toFixed(1)} KB gzipped (HTML + linked CSS and JS) is over its ${limitKB} KB budget in site.config.json "sizeBudgetKB"`);
    }
  }

  // Hosts in the site's JS and CSS files: the js/ folder, every script a page loads, and every linked stylesheet
  if (allowed) {
    for (const file of new Set([...jsFiles(join(config.rootDir, "js")), ...loadedJs, ...loadedCss])) {
      const text = readFileSync(file, "utf8");
      for (const p of hostProblems(file.endsWith(".css") ? text.replace(/\/\*[\s\S]*?\*\//g, "") : text, allowed)) fail(file.slice(config.rootDir.length + 1), p);
    }
  }

  // Color contrast
  if (config.contrast) {
    const { file = "css/tokens.css", pairs = [] } = config.contrast;
    const path = join(config.rootDir, file);
    if (!existsSync(path)) fail("contrast", `${file} doesn't exist (set "contrast.file" in site.config.json)`);
    else {
      const result = contrastProblems(readFileSync(path, "utf8"), pairs);
      for (const p of result.problems) fail(file, p);
      for (const w of result.warnings) warn(`${file}: ${w}`);
    }
  }

  // robots.txt -> sitemap
  const robots = join(config.rootDir, "robots.txt");
  if (existsSync(robots)) {
    for (const m of readFileSync(robots, "utf8").matchAll(/^Sitemap:\s*(\S+)/gim)) {
      const local = toLocal(m[1], config);
      if (!isInternal(local)) {
        if (config.siteUrl) fail("robots.txt", `Sitemap: ${m[1]} isn't on ${config.siteUrl}`);
      } else if (!resolveUrl(local, { file: robots }, config)) fail("robots.txt", `Sitemap: ${m[1]} points at a missing file`);
    }
  }

  if (config.siteUrl) {
    const file = join(config.rootDir, "sitemap.xml");
    if (existsSync(file)) {
      const listed = new Set([...readFileSync(file, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()));
      const wanted = new Set(sitemapPages(pages, config, (p) => raw.get(p.file)).map((p) => config.siteUrl + p.path));
      for (const url of wanted) if (!listed.has(url)) fail("sitemap.xml", `missing ${url}`);
      for (const url of listed) if (!wanted.has(url)) fail("sitemap.xml", `lists ${url}, which isn't a page that should be indexed`);
    }
  }

  for (const [name, list] of Object.entries(occurrences)) {
    if (!list.length) fail("facts", `"${name}" appears on no page; check its pattern`);
    if (listFacts) {
      console.log(`${name} (expected "${config.facts[name].value}"):`);
      for (const o of list) console.log(`  ${o.page}: ${o.found}`);
    }
  }

  if (config.clientCms) for (const p of buildCommandProblems(config.configDir ?? config.rootDir)) fail("clientCms", p);

  return applyKnown(problems, config.known ?? [], warn);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const config = loadConfig();
  if (config.clientCms && inHostBuild()) {
    console.warn('check: WARNING: this site has "clientCms": true, so the check must not run in the host build (a failure would stop the client\'s CMS saves from going live). Not checking. Remove it from the build command; it belongs in the pre-push hook only.');
    process.exit(0);
  }
  const problems = check(config, { listFacts: process.argv.includes("--facts") });
  const open = openChecks(dirname(fileURLToPath(import.meta.url)));
  if (open) console.warn(`check: warning: ${open} open line${open === 1 ? "" : "s"} in docs/checks-log.md (owner checks not done yet)`);
  if (problems.length) {
    console.error(`check: ${problems.length} problem${problems.length === 1 ? "" : "s"}\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  console.log("check: all good");
}
