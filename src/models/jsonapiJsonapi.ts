import { JsonapiMeta } from "./jsonapiMeta";

/** The `jsonapi` member of a document: the JSON:API version and meta. */
export class JsonapiJsonapi {
  /** The JSON:API version, e.g. `"1.1"`. */
  version?: string;
  /** The `meta` member. */
  meta: JsonapiMeta = new JsonapiMeta();

  /** Sets the JSON:API version. */
  setVersion(version: string): void {
    this.version = version;
  }

  /** Adds a meta member. */
  addMeta(key: string, value: unknown): void {
    this.meta.add(key, value);
  }

  /** Whether neither the version nor any meta is set. */
  empty(): boolean {
    return this.version === undefined && this.meta.empty();
  }
}
