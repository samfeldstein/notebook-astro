---
title: Email Form in Astro
aliases: Email Form in Astro
tags:
created: 2025-11-30
updated: 2025-11-30
---

[Resend](https://resend.com/) + [Astro Action](https://docs.astro.build/en/guides/actions/).

```js
// example action

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Resend } from 'resend';

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string(),
      email: z.string(),
      message: z.string(),
    }),
    handler: async function (input) {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: `[Contact Form] ${input.name} <from@domain.com>`,
        to: ['recipient@domain.com'],
        subject: `Contact Submission`,
        html: `
          <h1>Contact Submission</h1>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Message:</strong></p>
          <div>
            ${input.message}
          </div>
        `,
      });
      // success/error handling
    }
  }),
```

See [Taking things into my own hand](https://ryantrimble.com/blog/taking-things-into-my-own-hands-part-2/) by Ryan Trimble (code his).

