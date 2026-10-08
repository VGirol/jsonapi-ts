import { JsonapiLinks } from "./jsonapiLinks";
import { JsonapiMeta } from "./jsonapiMeta";

/** The `source` of an error object: what caused it in the request. */
export class JsonapiErrorSource {
  /** A JSON Pointer to the value of the request document that caused the error, e.g. `"/data/attributes/title"`. */
  pointer = "";
  /** The query parameter that caused the error. */
  parameter = "";
}

/** An error object of the `errors` member of a document. Every member is optional, as in the specification. */
export class JsonapiErrorObject {
  /** A unique identifier for this occurrence of the problem. */
  id?: string;
  /** The `links` member (`about`, `type`). */
  links = new JsonapiLinks();
  /** The HTTP status code, as a string. */
  status?: string;
  /** An application-specific error code. */
  code?: string;
  /** A short summary of the problem, the same for every occurrence. */
  title?: string;
  /** An explanation of this occurrence of the problem. */
  detail?: string;
  /** What caused the error in the request. */
  source = new JsonapiErrorSource();
  /** The `meta` member of the error. */
  meta: JsonapiMeta = new JsonapiMeta();
}

/** The `errors` member of a document. */
export class JsonapiErrors {
  private internal: JsonapiErrorObject[] = [];

  /** Whether there is no error. */
  empty(): boolean {
    return this.internal.length === 0;
  }

  /** Adds an error. */
  add(error: JsonapiErrorObject): void {
    this.internal.push(error);
  }

  /** All the errors. */
  all(): JsonapiErrorObject[] {
    return this.internal;
  }

  /** The `detail` of every error, one per line. */
  toString(): string {
    return this.internal
      .map((error) => error.detail)
      .filter((text) => typeof text !== "undefined")
      .join("\n");
  }
}
