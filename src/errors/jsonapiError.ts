/**
 * Base class of every error thrown by the client and its adapters.
 * Catch it to handle all the JSON:API failures at once, whatever the adapter.
 */
export class JsonapiError extends Error {
  /**
   * @param message - The error message.
   * @param options - The error options, e.g. the `cause`.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "JsonapiError";
  }
}
