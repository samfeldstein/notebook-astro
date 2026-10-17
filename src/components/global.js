import Salutation from "./letters/Salutation.astro";
import Signature from "./letters/Signature.astro";
import BlockQuote from "./notes/BlockQuote.astro";
import Callout from "./notes/Callout.astro";
import { Image } from 'astro:assets';

export const components = {
  BlockQuote,
  Callout,
  Image,
  Signature,
  Salutation
}