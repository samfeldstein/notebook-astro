---
title: Personal Website Notes
alias: Personal Website Notes
tags:
  - projects
  - web-development
  - astro
updated: 2025-02-27
---

I've rebuilt my [personal website](https://samfeldstein.xyz) at least four times, but the current version might be the one that's here to stay (from an architectural standpoint).

I built the site with [Astro](https://astro.build). The code is hosted on [GitHub](https://github.com/seldstein/personal-site-astro) and published with [Cloudflare Pages](https://pages.cloudflare.com).

## Astro

Part of the reason I think this is the version of this site that's here to stay is because I think Astro is the static site generator that's here to stay. I think this for two reasons:

1. Astro framework-agnostic. If you know HTML, CSS, and JavaScript, you can use Astro.
2. Astro forgoes a templating language in favor of web components.

The docs are solid, and the blog tutorial is as thorough as any I've seen. The community seems healthy, and whoever runs the thing clearly cares about doing things right and streamlining the process for users.

The hardest thing about Astro is keeping track of the data cascade. I try not to pass data between more than two components, because I just get all turned around.

Astro is also slightly rigid, especially when it comes to content collections. Let's say you want all your blog posts to share a common layout. To apply data to an entire folder, you have to turn that folder into a content collection. To do that, you have to put that folder inside a special `content` folder. And the `content` lives outside your `pages` folder. As far as I know, none of this is optional.

Maybe this isn't such a big deal most of the time, but I think it's bad practice in general to force users to put things in certain places. I'd prefer to arrange my content how I want.

## Web Components

This was my first time working with web components. I'm not running much JavaScript on the site, so I don't necessarily use all the powers they possess, but they still streamline the building process immensely.

For example, component let you scope scripts and styles to the component, rather than relying on a global css file. So a site built with components only loads the code that's actually used on the page. Astro enables this behavior by default.

This also makes it easier to manage styles. When I want to change my sidebar's appearance, I don't have to hunt around for `.sidebar` in my `styles.css` file. Instead, I just open the sidebar component, and the styles are there along with the html and JavaScript.

## Design

I agonized over the design for this site for quite some time. It is my personal site, after all, and I want to make a good first impression. But I'm uncomfortable with graphic design, so after a ton of iterations I decided to go with something simple but elegant. [Molly White's website](https://www.mollywhite.net) and [Gwern Branwen's website](https://gwern.net) were nice guideposts here.

### View transitions

- Handled with native `@view-transition` rule.
- Only supported in some browsers.
- Could have used Astro's ClientRouter component but seemed like overkill.

## Performance

I like to build fast websites because it makes me feel like I know what I'm doing. Styles and scripts are inlined by default, and thanks for component scoping, overall page size is kept to a minimum.

Astro lets you [enable global prefetching](https://docs.astro.build/en/guides/prefetch/#enable-prefetching), so I did.

The biggest performance boost came after I increased Cloudflare's cache lifespan. Assets are now saved to the browser, which means no more network requests for font files.

## Checklist

- Index pages for code and writing, etc
	- Link from contents on home page
- About the author
- Add resume to nav
- No text justification on list items that are also titles (eg writing page)
- i18n
- Convert to typographic punctuation at build
- Colophon
	- Acknowlegements
	- ~~Fonts~~
	- Write up style and architecture
		- I hope you won't be put off by the the minimalist style. It is merely a manifestation of my deepest fear: that of self-expression.
		- This is my website. There are many like it, but this one is mine.
- ~~Add Open Graph metadata.~~
- ~~Select colors.~~
- Dynamic blogroll
	- Render from csv
- Service worker
	- Check [Maggie Appleton’s](maggieappleton.com)
- Credit other fonts
- Style blockquotes same as notebook
- Fun bullets
- Global Head in resume and everywhere else
- Small caps on posts
- One page does one thing, and each page is an individual. I had too many ideas for themes that I liked, so I decided to do all of them.
- Overall goal is to build a fun, performant site that works for everyone. That's the standard, but it's not a design framework.
- My process is basically to mess around until I get something I like.
- Dropcaps in blog page
- Doing a different design for each page saved me the trouble of picking one, which would have been a lot more work in my mind.

## Wishlist

- Guest book
- Anonymous feedback form
- Notecard reading mode
	- Shows you one paragraph at a time
	- Dedicated app? As opposed to integrated with the website.
