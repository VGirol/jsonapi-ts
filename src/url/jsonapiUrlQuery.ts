import { UrlQueryItem, UrlQueryOptions } from "@/types";
import { toArray } from "@/support";

/** URL-encodes a name or a value. The commas are kept: they separate the items of a list. */
const encode = (value: unknown): string => encodeURIComponent(String(value)).replace(/%2C/gi, ",");

/** URL-decodes a name or a value. A malformed escape sequence (a lone "%") is kept as is. */
const decode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/** The query of a {@link JsonapiUrl}. */
export class JsonapiUrlQuery {
  private options: UrlQueryOptions = {};

  /** @param query - The initial query. */
  constructor(query?: UrlQueryOptions) {
    if (query) {
      this.setQuery(query);
    }
  }

  /** Replaces the whole query. */
  setQuery(query: UrlQueryOptions): void {
    this.options = query;
  }

  /** Returns a query parameter. */
  get(name: keyof UrlQueryOptions): Array<string | UrlQueryItem> | unknown | undefined {
    return this.options[name];
  }

  /** Sets a query parameter. */
  set(name: keyof UrlQueryOptions, value: Array<string | UrlQueryItem>): void {
    this.options[name] = value;
  }

  /** Whether a query parameter is set. */
  has(name: keyof UrlQueryOptions): boolean {
    return typeof this.get(name) !== "undefined";
  }

  /**
   * Removes values from a query parameter: the given strings (`include`, `sort`), or the items with the given names
   * (`fields`, `filter`, `page`).
   */
  remove(name: keyof UrlQueryOptions, values: Array<string>): void {
    if (!this.has(name)) {
      return;
    }

    const q = this.get(name) as Array<string | UrlQueryItem>;
    this.set(
      name,
      q.filter((item: string | UrlQueryItem) => {
        if (typeof item === "string") {
          return !values.includes(item);
        }

        return !values.includes(item.name);
      })
    );
  }

  /** Whether no query parameter is set. */
  empty(): boolean {
    return Object.keys(this.options).length === 0;
  }

  /** Adds the parameters of a query string (without the leading `?`), URL-decoding the names and values. */
  parseQuery(queryString?: string): void {
    if (typeof queryString === "undefined") {
      return;
    }

    queryString
      .split("&")
      .filter((query) => query !== "")
      .forEach((query: string) => {
        // Split at the first "=" only: a value may contain one once decoded
        const separator = query.indexOf("=");
        const param = decode(separator < 0 ? query : query.slice(0, separator));
        const value = separator < 0 ? "" : decode(query.slice(separator + 1));
        const [name, key] = param.replace("[]", "").replaceAll("][", ".").replace("]", "").split("[");
        switch (name) {
          case "fields":
          case "filter":
          case "page":
            if (typeof this.options[name] === "undefined") {
              this.options[name] = [];
            }
            (this.options[name] as Array<UrlQueryItem>).push({
              name: key,
              value: value
            });
            break;
          case "include":
          case "schema":
          case "sort":
          default:
            this.options[name] = value.split(",");
            break;
        }
      });
  }

  /**
   * Returns the query string, with its leading `?`, or `""` when the query is empty. The names and values are
   * URL-encoded, except the commas, which separate the items of a list.
   */
  toString(): string {
    if (typeof this.options === "undefined" || this.empty()) {
      return "";
    }

    const q = [];
    for (const [key, value] of Object.entries(this.options)) {
      if (value === null || value === undefined) {
        continue;
      }

      switch (key) {
        case "page":
        case "fields":
          (value as Array<UrlQueryItem>).forEach((item: UrlQueryItem) => {
            q.push(key + "[" + encode(item.name) + "]=" + encode(item.value));
          });
          break;
        case "filter":
          (value as Array<UrlQueryItem>).forEach((item: UrlQueryItem) => {
            const arr = item.name.split(".");
            q.push(key + "[" + arr.map(encode).join("][") + "]=" + encode(item.value));
          });
          break;
        case "include":
        case "schema":
        case "sort":
        default:
          q.push(encode(key) + "=" + toArray(value).map(encode).join(","));
          break;
      }
    }

    return "?" + q.join("&");
  }
}
