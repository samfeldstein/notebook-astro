---
title: Pairings - Project Notes
tags:
  - projects
  - software
  - javascript
  - programming
---

I had a friend who taught theology at a Catholic school and needed a way to pair her students with a random saint for a project. She hadn't yet found a tool for the job, so I built one for her.

Pairings is an app that generates random pairings from any two lists. This was first web application, and my first JavaScript-driven project.

I'd been learning JavaScript (piecemeal, with docs and online courses) for maybe three or four months when I built this app, and I'd rate the difficulty of the project somewhere between easy and medium.

## User Experience

I did my best to keep the interface simple but user-friendly. I didn't want users to see anything they didn't need to. For example, they don't see the form for adding new lists until they hit the "Create New List" button.

I reneged on this a little in the "All Lists" section. When you look at a list there, you see all the delete buttons and the "Save" button by default. This probably isn't ideal, and probably what I should have done was hide all that stuff behind an edit button.

## Data Storage

Lists are saved in local storage in an array called "All Lists." The way the app updates "All Lists" feels a bit clumsy. For example, if a user adds an item to a saved list, the app has to grab the "All Lists" array from local storage, update the one that's needed, and put the whole array back in local storage. If there is a way to more precisely target items in local storage, I didn't figure it out.

## Browser-Specific Styles

Browser-specific styles are a pain. I'd encountered this before, but it was a little more salient here because I had so many form elements. Ultimately it was a pretty simple fix, but it took some time to figure it out.

`<select>` element are extra-annoying, because you can't remove the default styles without removing the dropdown arrow. So I left those alone.

All of this is only relevant on mobile, as far as I can tell.

## Performance

I took a blunt force approach to rendering lists. For example, if you add items to a saved list and hit "Save Changes," the app re-renders the entire "List of Lists" section. I assume that's the least efficient way to do this, but it was also the easiest (or at least the most obvious).

I wanted to take a surgical approach, but I couldn't seem to get it done. The app is small enough that this doesn't seem like a huge deal, but maybe that's not the case on slow connections.

## PWA Features

The app is a partial PWA. You can download it to your phone and desktop, though desktop requires a Chromium browser. It's not available on the app store.

A service worker lets you use the app offline. I'd written a service worker before (for the [Prairie Rose Arena site](https://prairierosearena.com)), but I tried to simplify this one as much as possible.

Service workers scare me a little. They sort of feel like Pandora's Box, in that if you unleash one and it's doing something you didn't intend, it's hard to put it back in the box. Clearly I still have things to learn here. But the worker I've got seems to do the job.

What I would love to figure out is how to take a cache-first approach for all assets and doc types, and fetch updates through a periodic background sync. But all that's a little beyond me at this point. Maybe next time.

## Checklist

### Content

**About Page**

- ~~PWA instructions~~
- ~~Privacy Policy~~

### Accessibility

- ~~Test keyboard shortcuts~~
- ~~Test voiceover~~

### Features

- ~~Service worker~~

### Styles

- ~~Add fonts~~
- ~~Credits~~

### Performance

- ~~Preload fonts~~
- ~~Run Chrome Lighthouse~~

### Cross-browser testing

- ~~Chrome~~
- ~~Safari~~
- ~~Firefox~~
- ~~Vivaldi~~

### Docs

- ~~GitHub description~~
- ~~ReadMe~~
- ~~License~~
- ~~Project notes~~

### Share

- Instagram
- ~~Other socials~~
  - ~~Tag accounts of tools used~~
- Teacher friends
  <!-- - Robin -->
- Teacher forums
  - ~~r/teachers (post pending approval)~~
- Software forums
  - ~~r/webdev Showoff Saturday~~
  - ~~r/SideProject~~

## Resources

- [PWA Builder](https://docs.pwabuilder.com/#/builder/quick-start)