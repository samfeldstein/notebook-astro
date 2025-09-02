import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '@data/config';

const notes = (await getCollection('notes'))
  .filter(note => note.data.created) // Only include notes with a created date
  .sort((a, b) => b.data.created.valueOf() - a.data.created.valueOf());

export function GET(context) {
  return rss({
    // `<title>` field in output xml
    title: `${site.title}`,
    // `<description>` field in output xml
    description: `${site.description}`,
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.created,
      // Compute RSS link from note `id`
      // This example assumes all notes are rendered as `/blog/[id]` routes
      link: `/notes/${note.id}/`,
    })),
    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}