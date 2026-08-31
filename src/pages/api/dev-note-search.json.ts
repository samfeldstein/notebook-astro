import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

// This endpoint supplies searchable note data while running `astro dev`.
// Its URL is: /api/dev-note-search.json
export const GET: APIRoute = async () => {
  // Do not expose the complete note index in production.
  if (!import.meta.env.DEV) {
    return new Response(null, { status: 404 });
  }

  // Include private notes locally, matching the note route's dev behavior.
  const notes = await getCollection("notes");

  // Send only the fields needed by the browser search component.
  const searchIndex = notes.map((note) => ({
    id: note.id,
    title: note.data.title,
    description: note.data.description ?? "",
    body: note.body ?? "",
  }));

  return Response.json(searchIndex, {
    headers: {
      // Ensure changes are available immediately during development.
      "Cache-Control": "no-store",
    },
  });
};