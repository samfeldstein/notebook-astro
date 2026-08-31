---
title: Contact Form in Astro
tags:
  - astro
private: false
created: 2026-05-13
updated: 2026-05-13
---

Tried using Actions with static output (Astro component) and Cloudflare adapter, but `export const prerender = false` on the Contact page didn't seem to work.

Used a Vue component instead and I think we're in business.

Using [Resend](https://resend.com/astro). Configure send action in `src/actions/index.ts`.

```txt
Error: You can only send testing emails to your own email address (samfeld95@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.
```

## Issues

If you don't want Cloudflare to automatically process your images, add this to `astro.config.js`:

```js
adapter: cloudflare({imageService: 'compile',}),
```