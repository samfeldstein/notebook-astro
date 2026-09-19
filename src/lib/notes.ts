// src/lib/notes.ts
import { getCollection } from "astro:content";

export async function getPublicNotes() {
  return getCollection(
    "notes",
    ({ data }) => import.meta.env.DEV || data.private !== true,
  );
}