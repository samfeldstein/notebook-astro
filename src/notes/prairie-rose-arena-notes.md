---
title: Prairie Rose Arena - Project Notes
tags:
  - projects
  - web-development
  - eleventy
updated: 2024-10-10
---

[Prairie Rose Arena](https://prairierosearena.com) is an equestrian event center in Elkhart, IA. It's owned and operated by my mom, Sondra Feldstein. She had a little WordPress site already, but it wasn't as nice-looking as it could have been and it didn't work so well on mobile.

This was maybe the second website I ever built start to finish. I began the project in April 2024 and finished it in May 2024.

## Design

I'd never done any kind of graphic design before this, so I was really flying by the seat of my pants here. I began by thinking about an aesthetic that would suit the business. I love Westerns, so this wasn't hard. It didn't even take as long to find fonts as it might have because I knew exactly what I was looking for.

I started in Canva because it seemed user-friendly and I'd never used any design tools before, but at some point I got tired paying for it and switched to Figma, which is the better software anyway.

I don't know that I had any method or process or approach. I didn't know what I was doing, so it was a lot of trial and error, a lot of moving things around until they looked right. Overall, I'm very happy with how it turned out.

My takeaways here are twofold:

1. While I appreciate a beautiful website when I see one, I find graphic design somewhat torturous.
2. [Typographer Mediengestaltung](https://www.1001fonts.com/users/steffmann/) is the GOAT.

## Eleventy

I knew I wanted to use a static site generator and I happened to be messing with Eleventy at the time. I like static site generators because I like building sites by hand and, they give you total control over the output.

I used Nunjucks for templating. I learned it on the fly, but lucky for me, it's intuitive and easy to write. I'd use it again in a heartbeat if it weren't for the fact that I've become rather taken with web components.

The biggest challenge here was that Eleventy is written in JavaScript, and I knew very little JavaScript at the time. I was able to fumble my way through for the most part, but there were some issues I couldn't solve (more on that below).

## Decap CMS

My mom needed a way to add events to the site. I looked around for a headless CMS and settled on Decap. It was free and seemed user-friendly, and also worked well with Netlify, where the site is published.

Decap made it easy to keep things simple, which I liked. All my mom has to do to is log in, add some info about the event (title, date, url), and the event automatically renders on the Events page.

A unique page is generated for each event. But since my mom posts all event details on Facebook, this is kind of pointless. If I had to do it again, I'd generate the events from a data file instead. On the bright side, if my mom ever does decide to start posting more events info on the website, the infrastructure is there.

## Netlify

I don't remember if I chose Netlify because it worked with Decap or the other way around. Probably I went with it because it's simple, though these days I prefer Cloudflare Pages.

A decent experience on the whole, but too many paid features, some of which are not obviously paid features (like custom email templates). Probably will only use again for very simple projects like [[pairings-notes|Pairings]].

## Daily Re-Builds

I put an Upcoming Events section on the home page and the Events page and at some point realized they were only updating whenever I triggered a deploy. Because duh, it's a static site (we're learning).

The solution I found, courtesy of [James Doc](https://jamesdoc.com/blog/2023/11ty-daily-rebuilds/), was to set up a [Netlify build hook](https://docs.netlify.com/configure-builds/build-hooks/) and use a [GitHub action](https://docs.github.com/en/actions) to trigger it.

Rebuilding the site once a day seems a little much, but it was the best I could do with the knowledge I had. If I did it again, I'd probably use some JavaScript in a web component, but that was beyond me at the time.

## Service Worker

I was quite proud of myself for figuring out how to add a service worker to this site. I didn't know much JavaScript at all, but between [MDN Docs](https://github.com/mdn/dom-examples/tree/main/service-worker/simple-service-worker), an article by [Chris Ferdinandi](https://css-tricks.com/add-a-service-worker-to-your-site/), and ChatGPT, I managed to get it working.

I mainly wanted a service worker so that folks without an internet connection could still look at the website. I figured this was a plausible scenario since people often travel long distances to attend events at the arena. If they lose service, they can still browse a cached version of the site, provided they've accessed the site before on that device. And if those pages aren't available for any reason, the site shows them an `/offline/` page with my mom's contact info.

The other reason to have a worker is it makes the site very fast, a huge perk given my image optimization woes (see below).

## Performance

The site's Lighthouse scores leave something to be desired. This is largely due to mishandling of images (see below).

The service worker goes along way here. Theoretically, the only time a user should experience a slow page load is the first time they visit the site.

I did preload some images and fonts, though I'm not sure how much of a different it made.

If I knew then what I know now, I'd have cached fonts and other assets on the server side. I've done this with Cloudflare before, but I'm not sure how to do it with Netlify.

## Images

The site's images, other than being [Squooshed](https://squoosh.app), are not optimized. That's because I knew nothing about image optimization when I started this project. I tried to figure out Eleventy's image shortcode, but I failed (again, very little JS knowledge at this point).

On the plus side, I did learn how to reserve space for images so that they don't cause a big layout shift when they load. Though now that I'm looking at it again, it seems that I did this for every image except the logo.

I also never figured out how to automatically optimize images when they're uploaded to Decap, so I told my mom that whenever she wanted to add images to just give them to me and I'd do it. She rarely adds images, so this works for me.

## Takeaways

I would 10/10 use Eleventy again, and in fact I used it to build my digital notebook (the site you are currently on). Its greatest strength is its flexibility. You have total control over folder hierarchy, which is nice and sometimes essential.

Eleventy also has an intangible quality that I can only describe as playful. Its docs can be spare at times, but it's a one-man show over there. Props to [Zach Leatherman](https://www.zachleat.com) for building an incredible tool.
