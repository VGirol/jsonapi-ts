import { JsonapiError } from "./jsonapiError";

/**
 * The request was sent but no response was received (network failure, CORS, timeout...).
 * `cause` holds the error of the HTTP client.
 */
export class JsonapiNetworkError extends JsonapiError {
  /** @param cause - The error of the HTTP client. */
  constructor(cause: unknown) {
    super("API error : no response received.", { cause: cause });
    this.name = "JsonapiNetworkError";
  }
}
