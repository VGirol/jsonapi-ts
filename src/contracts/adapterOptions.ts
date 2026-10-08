import type { UrlType } from "@/types";
import type { Dictionary } from "@/services";

/**
 * The options of a request, as given to an adapter.
 *
 * @typeParam D - The type of the data to send.
 * @typeParam Opt - The options of the HTTP client of the adapter (`RequestInit` for `fetch`).
 */
// Each adapter narrows Opt to its own client options (RequestInit, AxiosRequestConfig...),
// so the default must stay assignable to all of them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AdapterOptions<D = unknown, Opt = any> {
  /** The URL of the request. */
  url: UrlType;
  /** The HTTP method. */
  method?: string;
  /** What to send: a model, a document already serialized, or any body the HTTP client accepts. */
  data?: D;
  /** Options passed as is to the HTTP client of the adapter. */
  clientOptions?: Opt;
  /**
   * The classes to instantiate when decoding the response. Set by `JsonapiHttpClient` from its own dictionary;
   * an adapter falls back to the shared `jsonapiDictionary` when it is missing.
   */
  dictionary?: Dictionary;
}
