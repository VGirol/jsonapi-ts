import { JsonapiDocument } from "@/models";
import { JsonapiError } from "./jsonapiError";

/**
 * The server answered successfully, but the document is missing or does not have the expected shape
 * (a collection where a single resource was expected, for example).
 */
export class JsonapiDocumentError extends JsonapiError {
  /** The document received, if any. */
  readonly document?: JsonapiDocument;

  /**
   * @param message - What was expected.
   * @param document - The document received, if any.
   * @param options - The error options, e.g. the `cause`.
   */
  constructor(message: string, document?: JsonapiDocument, options?: ErrorOptions) {
    super(message, options);
    this.name = "JsonapiDocumentError";
    this.document = document;
  }
}
