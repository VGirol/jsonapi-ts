import { UrlQueryOptions, UrlType } from "@/types";
import { JsonapiUrlQuery } from "./jsonapiUrlQuery";

/**
 * A JSON:API URL: a path and a query with `include`, `fields`, `filter`, `sort` and `page`.
 *
 * The query names and values are URL-encoded, except the commas that separate the items of a list.
 *
 * @example
 * ```ts
 * const url = new JsonapiUrl({
 *   path: "/articles",
 *   query: {
 *     include: ["author"],
 *     fields: [{ name: "articles", value: "title,author" }],
 *     filter: [{ name: "author.name", value: "Ada" }],
 *     sort: ["-publishedOn"],
 *     page: [{ name: "number", value: 2 }]
 *   }
 * });
 *
 * url.toString();
 * // /articles?include=author&fields[articles]=title,author&filter[author][name]=Ada&sort=-publishedOn&page[number]=2
 * ```
 */
export class JsonapiUrl {
  /** The URL without its query string. */
  path!: string;
  /** The query. */
  query: JsonapiUrlQuery = new JsonapiUrlQuery();

  /** Returns a URL, given as a string or as {@link UrlOptions}, as a string. */
  static asString(url: UrlType): string {
    return new this(url).toString();
  }

  /** @param init - A URL string to parse, or a path and a query. */
  constructor(init?: UrlType) {
    if (typeof init === "string") {
      this.parseUrl(init);

      return;
    }

    if (typeof init !== "undefined") {
      this.setPath(init.path);
      if (init.query) {
        this.setQuery(init.query);
      }
    }
  }

  /** Sets the path. */
  setPath(path: string): void {
    this.path = path;
  }

  /** Replaces the query. */
  setQuery(query: UrlQueryOptions): void {
    this.query.setQuery(query);
  }

  /** Sets the path and the query from a URL string. */
  parseUrl(url: string): void {
    const [path, query] = url.split("?");
    this.setPath(path);
    this.query.parseQuery(query);
  }

  /** Returns the URL, with its query string when the query is not empty. */
  toString(): string {
    let url = this.path;
    if (!this.query.empty()) {
      url += this.query.toString();
    }

    return url;
  }
}
