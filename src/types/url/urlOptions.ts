/** A named query value, as used by `fields`, `filter` and `page`. */
export interface UrlQueryItem {
  /**
   * The name: a resource type for `fields`, a filter name (dotted for nested filters: `"author.name"`) or a page
   * parameter (`number`, `size`, `offset`...).
   */
  name: string;
  /** The value. For `fields`, a comma-separated list of field names. */
  value: string | number | boolean | null;
}

/** The query of a JSON:API URL. Any other member is written as `name=value`, an array being joined with commas. */
export interface UrlQueryOptions {
  /** Sparse fieldsets: `fields[articles]=title,body`. */
  fields?: Array<UrlQueryItem>;
  /** Filters: `filter[status]=published`, or `filter[author][name]=Ada` for a dotted name. */
  filter?: Array<UrlQueryItem>;
  /** Relationships to include: `include=author,comments.author`. */
  include?: Array<string>;
  /** Written as `schema=a,b`. Not part of the specification: kept for servers that use it. */
  schema?: Array<string>;
  /** Sort fields, with `-` for a descending order: `sort=-publishedOn,title`. */
  sort?: Array<string>;
  /** Pagination: `page[number]=2&page[size]=20`. */
  page?: Array<UrlQueryItem>;
  /** Any other query parameter. */
  [key: string]: unknown;
}

/** A URL given as a path and a query. */
export interface UrlOptions {
  /** The URL without its query string, absolute or relative to the base URL of the HTTP client. */
  path: string;
  /** The query. */
  query?: UrlQueryOptions;
}

/** A URL, as a string or as {@link UrlOptions}. */
export type UrlType = string | UrlOptions;
