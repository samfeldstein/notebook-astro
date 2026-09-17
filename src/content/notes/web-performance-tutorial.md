---
title: Web Performance Tutorial
private: false
created: 2026-09-16
updated: 2026-09-16
---

## 1. Measure Before You Start

If you're optimizing an existing site, get a baseline first so you can prove your changes actually helped. Three tools cover most needs:

- **[PageSpeed Insights](https://pagespeed.web.dev/)** — lab and field data, Core Web Vitals
- **[WebPageTest](https://www.webpagetest.org/)** — deep waterfall analysis, filmstrips, multiple locations/connections
- **[Firefox Profiler](https://profiler.firefox.com/docs/#/)** — for digging into JS execution and rendering bottlenecks

Run one of these, save the report, and come back to it after you've made changes.

## 2. Use Component Architecture with Scoped Styles and Scripts

Build your site out of components that each have their own CSS and JS, rather than one global stylesheet and script bundle. This keeps unused code out of pages that don't need it and makes it much easier to apply the optimizations below on a per-component basis. Frameworks like Astro, Vue, and similar component-based tools handle this by default.

## 3. Optimize Fonts

Fonts are frequently the biggest render-blocking cost on a page. Your approach depends on how you're serving your site:

- **If you're behind a CDN** (like Cloudflare), self-host your fonts.
- **Otherwise**, serve them remotely via Google Fonts or a similar service.

### Self-hosting fonts

- **Use subsets.** Only ship the character ranges you actually need instead of the full font file.
- **Use fallback fonts with `size-adjust`.** Pick a fallback that closely matches your web font's metrics so there's minimal layout shift while the real font loads. Two references for solid fallback stacks: [system font options](https://practicaltypography.com/system-fonts.html) and [web-safe font stacks](https://www.cssfontstack.com/).
- **Preload critical fonts.** For any font used above the fold, add a preload link so the browser fetches it immediately instead of discovering it late via CSS:

```html
<link rel="preload" href="fonts/your-font.woff2" as="font" type="font/woff2" crossorigin />
```

### Serving from a remote service

- **Use `preconnect`** to the font host so the connection handshake happens early, in parallel with everything else.

## 4. Preload Critical Assets

Beyond fonts, identify any other assets the page needs immediately (hero images, critical scripts) and preload those too, so the browser doesn't have to discover them deep in the HTML or CSS before fetching.

## 5. Optimize HTML

Keep markup lean and semantic — see [MDN's HTML performance guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/HTML) for the full breakdown.

## 6. Optimize CSS

- **Find unused CSS** with the [Chrome CSS Overview panel](https://developer.chrome.com/docs/devtools/css-overview) and trim it.
- **Apply `content-visibility` to non-critical content.** This tells the browser to skip rendering work for elements until they're near the viewport:

```css
.defer {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px auto 100vh;
}
```

You must pair it with `contain-intrinsic-size` — without it, deferred elements collapse to 0 height and everything jumps into the viewport at once. One caveat: anchor links can jump to the wrong spot if their target hasn't rendered yet, so test in-page links carefully.

- **Inline critical styles.** Frameworks make this easy — [Astro](https://docs.astro.build/en/guides/styling/#inline-styles) and [Eleventy](https://www.11ty.dev/docs/quicktips/inline-css/) both support it out of the box.
- **Optimize fonts** (see step 3 above — font choices are a CSS performance issue too).
- **Add view transitions** ([`@view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition)) to smooth out navigations. This doesn't reduce load time, but it improves *perceived* performance, which matters just as much to users.

Further reading: [MDN's CSS performance guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS).

## 7. Optimize JS

Minimize what you ship and when it runs — see [MDN's JavaScript performance guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/JavaScript).

## 8. Minify

Minify your HTML, CSS, and JS before deploying. Most modern build tools (Astro, Vite, etc.) do this automatically in production builds.

## 9. Optimize Images

Images are usually the heaviest assets on a page, and there's a specific order of operations that works well:

1. **Compress images.** For web-optimized output, convert to WebP with `cwebp`:

```
cwebp input.jpg -o output.webp
```

2. **Optimize SVGs** with [SVGOMG](https://jakearchibald.github.io/svgomg/) to strip unnecessary metadata and paths.
3. **Serve different formats and sizes** responsively — Astro's `<Picture />` component handles this automatically, generating multiple formats/sizes and the right `srcset`.
4. **Prioritize critical images.** For anything above the fold (like a hero image), set `fetchPriority="high"` and `loading="eager"` so the browser fetches it immediately instead of deprioritizing it.
5. **Lazy-load everything else.** Non-critical images should lazy-load — Astro's `<Picture />` does this by default.
6. **Fix sizing issues** with [RespImageLint](https://ausi.github.io/respimagelint/), which flags responsive image mistakes (wrong `sizes`, missing `srcset` entries, etc.).
7. **Verify the result** in [PageSpeed Insights](https://pagespeed.web.dev).

## 10. Prefetch Pages

Prefetching lets the browser fetch a page's resources *before* the user clicks the link, so navigation feels instant. Support varies by browser and site scale:

- **Small site:** just add `rel="prefetch"` to the links you want prefetched ([MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prefetch)).
- **Larger site:** use the Speculation Rules API. This example prefetches all internal links at moderate eagerness:

```html
<script type="speculationrules">
{
  "prefetch": [{
    "source": "document",
    "where": {
    "href_matches": "/*/",
    "relative_to": "document"
    },
    "eagerness": "moderate"
  }]
}
</script>
```

Note that Speculation Rules are still experimental and not supported by every browser, so treat this as progressive enhancement, not a guarantee. If you're building with Astro, its built-in [Prefetch feature](https://docs.astro.build/en/guides/prefetch/) wraps this for you.

## 11. Cache Assets on the CDN

Put your static assets behind a CDN so they're served from a location close to the user rather than round-tripping to your origin server every time.

## 12. Cache Assets in the Browser

Set HTTP caching headers (`Cache-Control`, `ETag`, etc.) so returning visitors don't re-download assets that haven't changed.

## 13. Measure Again

Go back to the same tools from step 1 — PageSpeed Insights, WebPageTest, or the Firefox Profiler — and compare against your baseline. If a change didn't move the numbers, don't be afraid to revert it; performance work should be evidence-driven, not just "best practice for its own sake."

## Further reading

- [Web Performance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance) — MDN's full learning path
- [Web Font Best Practices](https://web.dev/articles/font-best-practices)
- [A Comprehensive Guide to Font Loading Strategies](https://www.zachleat.com/web/comprehensive-webfonts/)
- [Preload: What Is It Good For?](https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/)