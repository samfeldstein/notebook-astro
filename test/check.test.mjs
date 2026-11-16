// Tests for check.mjs. Each test builds a tiny site in a temp folder, so this
// file works both in the skill (scripts/test/) and copied into a site's test/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { check, contrastProblems, contrastRatio, hostProblems, inHostBuild, openChecks, parseColor, scriptProblems } from "../check.mjs";
import { loadConfig, sync } from "../sync.mjs";

const HEAD = `<title>Home</title><meta name="description" content="A page.">
<link rel="canonical" href="https://example.com/">
<link rel="stylesheet" href="/css/site.css">
<meta property="og:image" content="https://example.com/share.jpg">
<meta property="og:url" content="https://example.com/">
<script type="module" src="/js/app.js"></script>
<script type="application/ld+json">{"@context":"https://schema.org"}</script>`;
const BODY = `<h1>Hi</h1><label for="name">Name</label><input id="name"><button aria-controls="menu">Menu</button><nav id="menu"></nav><a href="https://other.example/">elsewhere</a>`;
const CSS = `:root {
  --white: #ffffff;
  --text: #333333;
  --gray: #777;
  --tint: oklch(0.4936 0.1913 259.08 / 10%);
  --old-green: oklch(0.6798 0.1797 151.74);
  --green: oklch(0.62 0.1797 151.74);
  --label: var(--text);
}`;
const CONFIG = {
  root: "site",
  siteUrl: "https://example.com",
  moduleScripts: true,
  allowedHosts: [],
  contrast: { file: "css/site.css", pairs: [{ fg: "--label", bg: "--white" }] },
  sizeBudgetKB: { default: 50 },
};

/** Build a site, run check, clean up. Returns { problems, warnings }. */
function run({ config = {}, head = HEAD, body = BODY, css = CSS, js = 'document.querySelector("h1");', robots, files = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "check-test-"));
  try {
    const all = {
      "site.config.json": JSON.stringify({ ...CONFIG, ...config }),
      "site/index.html": `<!doctype html><html lang="en"><head>${head}</head><body>${body}</body></html>`,
      "site/css/site.css": css,
      "site/js/app.js": js,
      "site/share.jpg": "x",
      "site/robots.txt": robots ?? "User-agent: *\nSitemap: https://example.com/sitemap.xml\n",
      ...files,
    };
    for (const [name, text] of Object.entries(all)) {
      mkdirSync(dirname(join(dir, name)), { recursive: true });
      writeFileSync(join(dir, name), text);
    }
    const cfg = loadConfig(dir);
    sync(cfg);
    const warnings = [];
    return { problems: check(cfg, { warnings }), warnings };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const has = (list, re) => list.some((p) => re.test(p));

test("a clean site passes with every rule on", () => {
  const { problems, warnings } = run();
  assert.deepEqual(problems, []);
  assert.deepEqual(warnings, []);
});

test("moduleScripts flags a classic script file and an unwrapped inline script", () => {
  const head = HEAD + `<script src="/js/app.js"></script><script>var leak = 1;</script><script>(() => { const ok = 1; })();</script>`;
  const { problems } = run({ head });
  assert.ok(has(problems, /<script src="\/js\/app\.js"> isn't type="module"/), problems.join("\n"));
  assert.equal(problems.filter((p) => /inline <script>: script declares var at the top level/.test(p)).length, 1, problems.join("\n"));
  assert.deepEqual(run({ head, config: { moduleScripts: false } }).problems, []);
});

test("allowedHosts flags third-party loads and hosts in JS, not plain links", () => {
  const body = BODY + `<img src="//img.example.io/a.png" alt=""><img src="https://example.com.evil.com/a.png" alt=""><iframe src="https://video.example.net/x"></iframe>`;
  const head = HEAD + `<script type="module" src="https://cdn.example.org/lib.js"></script>`;
  const js = 'fetch("https://tracker.example.com/x");';
  const { problems } = run({ head, body, js });
  for (const host of ["img.example.io", "example.com.evil.com", "video.example.net", "cdn.example.org", "tracker.example.com"]) {
    assert.ok(has(problems, new RegExp(host.replace(/\./g, "\\."))), `${host}\n${problems.join("\n")}`);
  }
  assert.ok(!has(problems, /other\.example/), problems.join("\n"));
  assert.deepEqual(run({ head, body, js, config: { allowedHosts: undefined } }).problems, []);
  assert.deepEqual(run({ head, body, js, config: { allowedHosts: ["img.example.io", "example.com.evil.com", "video.example.net", "cdn.example.org", "tracker.example.com"] } }).problems, []);
});

test("full URLs on siteUrl are checked as internal; look-alike hosts are not", () => {
  const head = HEAD.replace("https://example.com/share.jpg", "https://example.com/missing.jpg") + `<meta name="twitter:image" content="https://example.com.evil.com/x.jpg">`;
  const { problems } = run({ head, config: { allowedHosts: undefined } });
  assert.ok(has(problems, /<meta og:image> points at a missing file: https:\/\/example\.com\/missing\.jpg/), problems.join("\n"));
  assert.ok(!has(problems, /evil/), problems.join("\n"));
});

test("for and aria-* must name ids on the page", () => {
  const { problems } = run({ body: BODY + `<label for="nope">x</label><p aria-describedby="name gone">y</p>` });
  assert.ok(has(problems, /<label for="nope"> names an id/), problems.join("\n"));
  assert.ok(has(problems, /aria-describedby="gone"/), problems.join("\n"));
  assert.ok(!has(problems, /aria-describedby="name"/), problems.join("\n"));
});

test("robots.txt Sitemap lines must point at a file on the site", () => {
  const { problems } = run({ robots: "Sitemap: https://example.com/sitemap-2.xml\nSitemap: https://elsewhere.example/sitemap.xml\n" });
  assert.ok(has(problems, /robots\.txt: Sitemap: https:\/\/example\.com\/sitemap-2\.xml points at a missing file/), problems.join("\n"));
  assert.ok(has(problems, /robots\.txt: Sitemap: https:\/\/elsewhere\.example\/sitemap\.xml isn't on/), problems.join("\n"));
});

test("sizeBudgetKB uses the per-path budget over the default", () => {
  const { problems } = run({ config: { sizeBudgetKB: { default: 50, "/": 0.1 } } });
  assert.ok(has(problems, /index\.html: .* KB gzipped .* over its 0\.1 KB budget/), problems.join("\n"));
  assert.deepEqual(run({ config: { sizeBudgetKB: undefined } }).problems, []);
});

test("contrast matches known ratios for hex and oklch (oklch figures from Little Peaks' green fix)", () => {
  const white = parseColor("#fff").rgb;
  const near = (a, b) => assert.ok(Math.abs(a - b) < 0.02, `${a} vs ${b}`);
  near(contrastRatio(parseColor("#777777").rgb, white), 4.48);
  near(contrastRatio(parseColor("oklch(0.6798 0.1797 151.74)").rgb, white), 2.68);
  near(contrastRatio(parseColor("oklch(0.62 0.1797 151.74)").rgb, white), 3.32); // the fix commit said 3.31; an independent OKLab-XYZ path gives 3.320
  near(contrastRatio(parseColor("rgb(0 0 0)").rgb, white), 21);
});

test("contrastProblems resolves var(), applies min, composites see-through colors, and reports what it can't read", () => {
  const r = (pairs) => contrastProblems(CSS, pairs);
  assert.deepEqual(r([{ fg: "--label", bg: "--white" }]).problems, []);
  assert.match(r([{ fg: "--gray", bg: "--white" }]).problems[0], /--gray on --white is 4\.48:1, below 4\.5:1/);
  assert.deepEqual(r([{ fg: "--green", bg: "--white", min: 3 }]).problems, []);
  assert.match(r([{ fg: "--text", bg: "--tint" }]).problems[0], /see-through; add "over"/);
  assert.deepEqual(r([{ fg: "--text", bg: "--tint", over: "--white" }]).problems, []);
  assert.deepEqual(r([{ fg: "#4b5563", bg: "--white" }]).problems, []);
  assert.match(r([{ fg: "--nope", bg: "--white" }]).problems[0], /can't resolve --nope/);
});

test("a contrast pair marked known warns instead of failing, and says when it starts passing", () => {
  const known = run({ config: { contrast: { file: "css/site.css", pairs: [{ fg: "--green", bg: "--white", known: "brand color, Sam to decide" }] } } });
  assert.deepEqual(known.problems, []);
  assert.ok(has(known.warnings, /--green on --white is 3\.3\d:1, below 4\.5:1 \(known: brand color/), known.warnings.join("\n"));
  const passing = run({ config: { contrast: { file: "css/site.css", pairs: [{ fg: "--text", bg: "--white", known: "old note" }] } } });
  assert.ok(has(passing.warnings, /now meets 4\.5:1; remove its "known" note/), passing.warnings.join("\n"));
});

test("scriptProblems flags any top-level declaration in a classic script", () => {
  for (const ok of [
    "(() => {\n  const a = 1;\n})();\n",
    "(function () { var a = 1; })();",
    "(function () { var a = 1; }());",
    "// note\n(async () => { await 1; })();",
    "!function(){ var a = 1; }();",
    "(() => {})(); // end",
    "'use strict';(() => { let x; })();",
    "(function(){ const y = 1; }).call(this);",
    'console.log("var x = 1; function f(){}");',
  ]) assert.deepEqual(scriptProblems(ok), [], ok);
  for (const bad of ["const reduceMotion = 1;", "(() => {})();\nconst leak = 1;", "(() => {})();\nvar leak=1;\n(() => {})();", "function helper() {}", "class A {}"]) {
    assert.equal(scriptProblems(bad).length, 1, bad);
  }
});

test("hostProblems allows listed hosts and flags others", () => {
  const allowed = ["example.com", "www.w3.org"];
  assert.deepEqual(hostProblems('createElementNS("http://www.w3.org/2000/svg", "svg")', allowed), []);
  assert.equal(hostProblems('fetch("https://analytics.example.net/x")', allowed).length, 1);
  assert.equal(hostProblems('import("//cdn.example.net/lib.js")', allowed).length, 1);
  assert.equal(hostProblems('fetch("https://example.com@evil.example.net/x")', allowed).length, 1);
  assert.equal(hostProblems('fetch("http://127.0.0.1:8080/")', allowed).length, 1);
  assert.equal(hostProblems('fetch("http://localhost/")', allowed).length, 1);
  assert.deepEqual(hostProblems("x(); //helpers.js", allowed), []);
});

test("tags with > in a quoted attribute, malformed % in a URL, and data: srcsets don't break the check", () => {
  const body = BODY + `<img alt="a > b" id="z" src="/share.jpg"><label for="z">z</label><a href="/100%">odd</a><img alt="" srcset="data:image/png;base64,AAAA 1x, /share.jpg 2x">`;
  const { problems } = run({ body });
  assert.ok(!has(problems, /for="z"|AAAA/), problems.join("\n"));
  assert.ok(has(problems, /points at a missing file: \/100%/), problems.join("\n"));
});

test("URLs on siteUrl match by host, any case and either scheme", () => {
  const body = BODY + `<img alt="" src="http://example.com/missing-a.png"><img alt="" src="HTTPS://EXAMPLE.COM/missing-b.png">`;
  const { problems } = run({ body });
  assert.ok(has(problems, /missing-a\.png/) && has(problems, /missing-b\.png/), problems.join("\n"));
});

test("fragment links and popovertarget must name ids on the page", () => {
  const body = BODY + `<a href="#nowhere">x</a><a href="#menu">ok</a><a href="#top">top</a><button popovertarget="gone">p</button>`;
  const { problems } = run({ body });
  assert.ok(has(problems, /<a href="#nowhere">/), problems.join("\n"));
  assert.ok(has(problems, /popovertarget="gone"/), problems.join("\n"));
  assert.ok(!has(problems, /#menu|#top/), problems.join("\n"));
});

test("allowedHosts covers CSS @import and url(), style attributes, embed, and object", () => {
  const css = CSS + `\n@import url("https://fonts.example.com/a.css");\n/* url(https://commented.example.com/x) */`;
  const body = BODY + `<div style="background: url(https://bg.example.com/a.png)"></div><embed src="https://embed.example.com/x"><object data="https://obj.example.com/x"></object>`;
  const { problems } = run({ css, body });
  for (const host of ["fonts.example.com", "bg.example.com", "embed.example.com", "obj.example.com"]) assert.ok(has(problems, new RegExp(host.replace(/\./g, "\\."))), `${host}\n${problems.join("\n")}`);
  assert.ok(!has(problems, /commented/), problems.join("\n"));
});

test("contrast ignores commented-out declarations and !important", () => {
  const css = "/* --fg: #fff; */ :root { --fg: #000 !important; --bg: #fff; }";
  assert.deepEqual(contrastProblems(css, [{ fg: "--fg", bg: "--bg" }]).problems, []);
});

test("openChecks counts unticked lines in docs/checks-log.md", () => {
  const dir = mkdtempSync(join(tmpdir(), "check-log-"));
  try {
    assert.equal(openChecks(dir), 0);
    mkdirSync(join(dir, "docs"));
    writeFileSync(join(dir, "docs/checks-log.md"), "# Checks log\n\n```markdown\n- [ ] example\n```\n\n## Open\n\n- [ ] one\n- [ ] two\n\n## Done\n\n- [x] three\n");
    assert.equal(openChecks(dir), 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("built skips the sync step and writes no sitemap.xml", () => {
  const { problems } = run({ config: { built: true }, robots: "User-agent: *\n" });
  assert.deepEqual(problems, []);
  const dir = mkdtempSync(join(tmpdir(), "check-built-"));
  try {
    const page = '<html><body><!-- shared:header --><!-- /shared:header --></body></html>';
    mkdirSync(join(dir, "site"));
    mkdirSync(join(dir, "shared"));
    writeFileSync(join(dir, "site/index.html"), page);
    writeFileSync(join(dir, "shared/header.html"), "<header>H</header>");
    writeFileSync(join(dir, "site.config.json"), JSON.stringify({ root: "site", siteUrl: "https://example.com", built: true }));
    assert.deepEqual(sync(loadConfig(dir)), []);
    assert.equal(existsSync(join(dir, "site/sitemap.xml")), false);
    assert.equal(readFileSync(join(dir, "site/index.html"), "utf8"), page);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skipPages leaves out an exact page and a folder", () => {
  const files = { "site/admin/index.html": '<html><body><script src="https://unpkg.com/x.js"></script></body></html>', "site/letters/a/index.html": "<html><body>no title</body></html>" };
  assert.ok(run({ files }).problems.length > 0);
  const { problems } = run({ files, config: { skipPages: ["admin/index.html", "letters/"] } });
  assert.deepEqual(problems, []);
});

test("known turns one page's matching failure into a warning, and nothing else", () => {
  const files = { "site/a.html": '<html lang="en"><head><title>A</title><meta name="description" content="a"></head><body><h1>A</h1><a href="/missing/">x</a></body></html>' };
  const noSitemap = ["404.html", "a.html"];
  const known = [{ page: "a.html", match: "missing file: /missing/", why: "by design" }, { page: "b.html", match: "x" }];
  const { problems, warnings } = run({ files, config: { known, noSitemap } });
  assert.deepEqual(problems, []);
  assert.ok(has(warnings, /known \(by design\): a\.html: .*\/missing\//), warnings.join("\n"));
  assert.ok(has(warnings, /entry for b\.html \(x\) matches nothing/), warnings.join("\n"));
  const other = run({ files, config: { known: [{ page: "index.html", match: "missing file" }], noSitemap } });
  assert.ok(has(other.problems, /^a\.html: .*\/missing\//), other.problems.join("\n"));
  assert.ok(has(run({ config: { known: [{ match: "x" }] } }).problems, /needs a "page" and a "match"/));
  assert.ok(has(run({ config: { known: [{ page: "a.html", match: "(" }] } }).problems, /bad "match"/));
  const cms = run({ config: { clientCms: true, known: [{ page: "clientCms", match: "." }] }, files: { "package.json": JSON.stringify({ scripts: { build: "node check.mjs" } }) } });
  assert.ok(has(cms.problems, /^clientCms: /), cms.problems.join("\n"));
});

test("a known folder entry covers pages under it only", () => {
  const page = (t) => `<html lang="en"><head><title>${t}</title><meta name="description" content="d"></head><body><h1>${t}</h1></body></html>`;
  const files = { "site/events/a/index.html": page("A"), "site/other/index.html": page("O") };
  const { problems, warnings } = run({ files, config: { known: [{ page: "events/", match: "^missing canonical link" }] } });
  assert.ok(has(warnings, /known: events\/a\/index\.html: missing canonical/), warnings.join("\n"));
  assert.ok(has(problems, /^other\/index\.html: missing canonical/), problems.join("\n"));
  assert.ok(!has(problems, /^events\//), problems.join("\n"));
});

test("a percent-encoded canonical matches a page path with a space or non-ASCII letters", () => {
  const page = (href) => `<html lang="en"><head><title>T</title><meta name="description" content="d"><link rel="canonical" href="${href}"></head><body><h1>T</h1></body></html>`;
  const ok = run({ files: { "site/foam projects/index.html": page("https://example.com/foam%20projects/"), "site/𝚫pted/index.html": page("https://example.com/%F0%9D%9A%ABpted/") } });
  assert.ok(!has(ok.problems, /canonical/), ok.problems.join("\n"));
  const bad = run({ files: { "site/foam projects/index.html": page("https://example.com/foam-projects/") } });
  assert.ok(has(bad.problems, /^foam projects\/index\.html: canonical is/), bad.problems.join("\n"));
});

test("clientCms fails when a build command in the repo runs the check", () => {
  const pkg = (scripts) => JSON.stringify({ scripts });
  assert.deepEqual(run({ config: { clientCms: true }, files: { "package.json": pkg({ build: "astro build" }), "netlify.toml": '[build]\n  command = "npm run build"\n' } }).problems, []);
  for (const files of [
    { "package.json": pkg({ build: "astro build && node check.mjs" }) },
    { "package.json": pkg({ postbuild: "node --test test/*.test.mjs" }) },
    { "netlify.toml": '[build]\n  command = "npm run build && node check.mjs"\n' },
    { "wrangler.jsonc": '{ "build": { "command": "node check.mjs" } }' },
    { "netlify.toml": '[build]\n  command = "npm run netlify-build"\n', "package.json": pkg({ "netlify-build": "astro build && npm test", test: "node --test test/*.test.mjs" }) },
    { "package.json": pkg({ build: "npm run build:all", "build:all": "astro build && node check.mjs" }) },
  ]) assert.ok(has(run({ config: { clientCms: true }, files }).problems, /^clientCms: .*CMS saves/), JSON.stringify(files));
  assert.deepEqual(run({ files: { "package.json": pkg({ build: "astro build && node check.mjs" }) } }).problems, []);
});

test("inHostBuild sees Netlify and Cloudflare builds but not plain CI", () => {
  assert.equal(inHostBuild({ NETLIFY: "true" }), true);
  assert.equal(inHostBuild({ WORKERS_CI: "1" }), true);
  assert.equal(inHostBuild({ CF_PAGES: "1" }), true);
  assert.equal(inHostBuild({ CI: "true" }), false);
  assert.equal(inHostBuild({ NETLIFY: "false" }), false);
  assert.equal(inHostBuild({}), false);
});

test("on a clientCms site, check.mjs passes without checking in a host build and fails locally", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  // realpath: on macOS the temp folder is behind a symlink, and check.mjs only runs as a script when argv[1] is its real path.
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "check-cms-")));
  try {
    for (const f of ["check.mjs", "sync.mjs"]) copyFileSync(join(here, "..", f), join(dir, f));
    mkdirSync(join(dir, "site"));
    writeFileSync(join(dir, "site/index.html"), "<html><body>broken</body></html>");
    writeFileSync(join(dir, "site.config.json"), JSON.stringify({ root: "site", clientCms: true }));
    const env = { ...process.env, NETLIFY: "", WORKERS_CI: "", CF_PAGES: "" };
    assert.equal(spawnSync(process.execPath, [join(dir, "check.mjs")], { env }).status, 1);
    const host = spawnSync(process.execPath, [join(dir, "check.mjs")], { env: { ...env, NETLIFY: "true" } });
    assert.equal(host.status, 0);
    assert.match(host.stderr.toString(), /clientCms.*Not checking/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
