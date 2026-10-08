import { AdapterOptions, AdapterResponse } from "@/contracts";
import { JsonapiResource } from "@/models";

/** The options of a request sent by the {@link FetchAdapter}: its client options are a `RequestInit`. */
export type FetchAdapterOptions<D = unknown> = AdapterOptions<D, RequestInit>;

/** The options seen by the request interceptors: `clientOptions` is always set. */
export type FetchAdapterOptionsWithInit<D = unknown> = FetchAdapterOptions<D> & { clientOptions: RequestInit };

/** The response of the {@link FetchAdapter}: its client response is the `Response` of `fetch`. */
export type FetchAdapterResponse<R extends JsonapiResource = JsonapiResource> = AdapterResponse<R, Response>;

/** The kind of an interceptor of the {@link FetchAdapter}. */
export type InterceptorType = "request" | "response" | "error";

/** A request interceptor of the {@link FetchAdapter}: returns the options, changed or not, or a promise of them. */
export type RequestInterceptor = (
  options: FetchAdapterOptionsWithInit
) => FetchAdapterOptionsWithInit | Promise<FetchAdapterOptionsWithInit>;

/** A response interceptor of the {@link FetchAdapter}: returns the response, changed or not, or a promise of it. */
export type ResponseInterceptor = <R extends JsonapiResource = JsonapiResource>(
  response: FetchAdapterResponse<R>
) => FetchAdapterResponse<R> | Promise<FetchAdapterResponse<R>>;

/** An error interceptor of the {@link FetchAdapter}: returns the error to throw, or a promise of it. */
export type ErrorInterceptor = (error: unknown) => unknown | Promise<unknown>;

/** A request interceptor with its name, as given to the {@link FetchAdapter}. */
export interface NamedRequestInterceptor {
  /** The name, used to remove the interceptor. Unique among the request interceptors. */
  name: string;
  /** The interceptor function. */
  interceptor: RequestInterceptor;
  /** Whether the interceptor is removed after the next request. */
  once?: boolean;
}

/** A response interceptor with its name, as given to the {@link FetchAdapter}. */
export interface NamedResponseInterceptor {
  /** The name, used to remove the interceptor. Unique among the response interceptors. */
  name: string;
  /** The interceptor function. */
  interceptor: ResponseInterceptor;
  /** Whether the interceptor is removed after the next request. */
  once?: boolean;
}

/** A error interceptor with its name, as given to the {@link FetchAdapter}. */
export interface NamedErrorInterceptor {
  /** The name, used to remove the interceptor. Unique among the error interceptors. */
  name: string;
  /** The interceptor function. */
  interceptor: ErrorInterceptor;
  /** Whether the interceptor is removed after the next request. */
  once?: boolean;
}

export interface RegisteredResponseInterceptor {
  name: string;
  type: "response";
  interceptor: ResponseInterceptor;
  once: boolean;
}

export interface RegisteredRequestInterceptor {
  name: string;
  type: "request";
  interceptor: RequestInterceptor;
  once: boolean;
}

export interface RegisteredErrorInterceptor {
  name: string;
  type: "error";
  interceptor: ErrorInterceptor;
  once: boolean;
}

export type RegisteredInterceptor =
  | RegisteredRequestInterceptor
  | RegisteredResponseInterceptor
  | RegisteredErrorInterceptor;
