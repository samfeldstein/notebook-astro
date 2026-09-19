import rss from '@astrojs/rss';
import { getPublicNotes } from "@src/lib/notes";
import { site } from '@data/config';

export async function GET(context) {
  const notes = (await getPublicNotes())
    .filter((note) => note.data.created)
    .sort((a, b) => b.data.created.valueOf() - a.data.created.valueOf());

  return rss({
    title: site.title,
    description: site.description,
    site: context.site,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.created,
      link: `/notes/${note.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}