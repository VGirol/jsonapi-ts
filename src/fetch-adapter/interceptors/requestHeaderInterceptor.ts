import { FetchAdapterOptionsWithInit, RequestInterceptor } from "../types";
import { isJsonBody } from "./jsonBody";

export const RequestHeaderInterceptor: RequestInterceptor = (
  options: FetchAdapterOptionsWithInit
): FetchAdapterOptionsWithInit => {
  // Set request headers, keeping the ones given by the caller
  const headers = new Headers(options.clientOptions.headers ?? {});

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/vnd.api+json");
  }
  if (isJsonBody(options.data) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/vnd.api+json");
  }

  options.clientOptions.headers = headers;

  return options;
};
