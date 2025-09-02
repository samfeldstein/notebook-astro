---
title: Environment Variables in Cloudflare Pages
aliases:
  - Environment Variables in Cloudflare Pages
tags:
  - cloudflare
created: 2025-07-21
updated: 2025-07-21
---

<aside class="callout"><p>This is how I did it with Astro, which I think use native ES6 syntax for environment variable imports, which makes me think it should work the same elsewhere, but don't hold me to it.</p></aside>

Add the variable to your `.env` file. Place the file at the root.

```txt
MY_API_KEY="myApiKey"
```

Then import the variable in your `.astro` file frontmatter:

```js
---
const key = import.meta.env.MY_API_KEY
---
```

Now go to your site settings in your Cloudflare dashboard. Select your environment (**Production** or **Preview**). You have to manually set your variable for each environment (I think). 

Now find the section called **Variables and Secrets.** Add your variable and designate it as plain text or an encrypted secret. Make sure the variable name matches the one in your `.env` file.

Save the variable, push the changes from your local repo, and build your site.

## Secrets

Astro adds `.env` to `.gitignore` by default so your environment variables don’t wind up in your GitHub repo. Whether you designate your variable as a secret in Cloudflare or not, everything should work the same.