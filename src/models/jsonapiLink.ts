import { JsonapiMeta } from "./jsonapiMeta";

/** A link: a plain URL, or a link object with `href` and `meta`. */
export class JsonapiLink {
  /** The URL of a link given as a string, or `null` for an empty link. */
  url?: string | null;
  /** The URL of a link given as an object. */
  href?: string;
  /** The `meta` member of a link object. */
  meta: JsonapiMeta = new JsonapiMeta();
}
