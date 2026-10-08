import { JsonapiDocument } from "@/models";
import { JsonapiError } from "./jsonapiError";

/**
 * The server answered with a status outside the 2xx range.
 * `document` holds the decoded JSON:API body (with its `errors`) when the server sent one.
 * `response` is the client's own response object (`Response` for the fetch adapter).
 */
export class JsonapiResponseError<C = unknown> extends JsonapiError {
  /** The HTTP status of the response. */
  readonly status: number;
  /** The decoded JSON:API body, with its `errors`, when the server sent one. */
  readonly document?: JsonapiDocument;
  /** The response object of the HTTP client: `Response` for `fetch`, `AxiosResponse` for Axios. */
  readonly response: C;

  /**
   * @param status - The HTTP status.
   * @param response - The response object of the HTTP client.
   * @param document - The decoded body, if any.
   * @param options - The error options, e.g. the `cause`.
   */
  constructor(status: number, response: C, document?: JsonapiDocument, options?: ErrorOptions) {
    super(`API error : request failed with status ${status}.`, options);
    this.name = "JsonapiResponseError";
    this.status = status;
    this.response = response;
    this.document = document;
  }
}
