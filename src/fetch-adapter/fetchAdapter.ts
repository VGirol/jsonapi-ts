import { AdapterContract } from "@/contracts";
import {
  FetchAdapterOptions,
  FetchAdapterOptionsWithInit,
  FetchAdapterResponse,
  InterceptorType,
  NamedErrorInterceptor,
  NamedRequestInterceptor,
  NamedResponseInterceptor,
  RegisteredErrorInterceptor,
  RegisteredInterceptor,
  RegisteredRequestInterceptor,
  RegisteredResponseInterceptor
} from "./types";
import { pipe, toArray } from "@/support";
import { JsonapiDocument, JsonapiResource } from "@/models";
import { JsonapiNetworkError, JsonapiResponseError } from "@/errors";
import { DocumentDto, ExtractAttributeType } from "@/types";
import {
  RequestDataInterceptor,
  RequestHeaderInterceptor,
  RequestJsonapiVersionInterceptor,
  ResponseErrorInterceptor
} from "./interceptors";
import { JsonapiUrl } from "@/url";
import { Deserializer } from "@/deserializers";
import { Dictionary, jsonapiDictionary } from "@/services";

/**
 * The default adapter, built on the global `fetch`.
 *
 * A request goes through the request interceptors, then `fetch`, then the response interceptors. Any error goes through
 * the error interceptors, and what they return is thrown. The interceptors run in the order they were added, the
 * default ones first:
 *
 * - `request-header` (request): sets `Accept`, and `Content-Type` when a JSON body is sent, unless the caller set them;
 * - `request-jsonapi-version` (request): sets the `jsonapi.version` of a document sent;
 * - `request-encode-data` (request): serializes a model or a plain object to JSON;
 * - `response-error` (error): returns the error unchanged.
 *
 * An interceptor is identified by its type and its name: adding one with a name already used does nothing.
 *
 * @example
 * ```ts
 * const adapter = new FetchAdapter().addRequestInterceptor({
 *   name: "auth",
 *   interceptor: (options) => {
 *     const headers = new Headers(options.clientOptions.headers);
 *     headers.set("Authorization", `Bearer ${token}`);
 *     options.clientOptions.headers = headers;
 *     return options;
 *   }
 * });
 * const client = JsonapiHttpClient.make(adapter);
 * ```
 */
export class FetchAdapter implements AdapterContract {
  private _interceptors: RegisteredInterceptor[] = [];

  /** Creates an adapter with the default interceptors. */
  constructor() {
    this.addDefaultInterceptors();
  }

  /** Adds the default interceptors (those already registered are kept). */
  addDefaultInterceptors(): this {
    this.addRequestInterceptors([
      {
        name: "request-header",
        interceptor: RequestHeaderInterceptor
      },
      {
        name: "request-jsonapi-version",
        interceptor: RequestJsonapiVersionInterceptor
      },
      {
        name: "request-encode-data",
        interceptor: RequestDataInterceptor
      }
    ]);

    this.addErrorInterceptors([
      {
        name: "response-error",
        interceptor: ResponseErrorInterceptor
      }
    ]);

    return this;
  }

  /** Adds several request interceptors, in order. */
  addRequestInterceptors(interceptors: NamedRequestInterceptor | NamedRequestInterceptor[]): this {
    toArray(interceptors).forEach((interceptor) => this.addRequestInterceptor(interceptor));

    return this;
  }

  /** Adds a request interceptor. It receives the options of the request, with `clientOptions` set, and returns them. */
  addRequestInterceptor({ interceptor, name, once }: NamedRequestInterceptor): this {
    return this.addInterceptor({
      name: name,
      type: "request",
      interceptor: interceptor,
      once: once ?? false
    });
  }

  /** Adds several response interceptors, in order. */
  addResponseInterceptors(interceptors: NamedResponseInterceptor | NamedResponseInterceptor[]): this {
    toArray(interceptors).forEach((interceptor) => this.addResponseInterceptor(interceptor));

    return this;
  }

  /** Adds a response interceptor. It receives the decoded response and returns it. */
  addResponseInterceptor({ interceptor, name, once }: NamedResponseInterceptor): this {
    return this.addInterceptor({
      name: name,
      type: "response",
      interceptor: interceptor,
      once: once ?? false
    });
  }

  /** Adds several error interceptors, in order. */
  addErrorInterceptors(interceptors: NamedErrorInterceptor | NamedErrorInterceptor[]): this {
    toArray(interceptors).forEach((interceptor) => this.addErrorInterceptor(interceptor));

    return this;
  }

  /** Adds an error interceptor. It receives the error and returns the error to throw (the same or another one). */
  addErrorInterceptor({ interceptor, name, once }: NamedErrorInterceptor): this {
    return this.addInterceptor({
      name: name,
      type: "error",
      interceptor: interceptor,
      once: once ?? false
    });
  }

  private addInterceptor(interceptor: RegisteredInterceptor): this {
    if (this._interceptors.find((item) => item.name == interceptor.name && item.type == interceptor.type)) {
      return this;
    }

    this._interceptors.push(interceptor);

    return this;
  }

  /**
   * Removes a request interceptor.
   *
   * @throws Error when no request interceptor has this name.
   */
  removeRequestInterceptor(name: string): this {
    return this.removeInterceptor(name, "request");
  }

  /**
   * Removes a response interceptor.
   *
   * @throws Error when no response interceptor has this name.
   */
  removeResponseInterceptor(name: string): this {
    return this.removeInterceptor(name, "response");
  }

  /**
   * Removes an error interceptor.
   *
   * @throws Error when no error interceptor has this name.
   */
  removeErrorInterceptor(name: string): this {
    return this.removeInterceptor(name, "error");
  }

  /**
   * Removes an interceptor.
   *
   * @throws Error when no interceptor of this type has this name.
   */
  removeInterceptor(name: string, type: InterceptorType): this {
    const interceptor = this._interceptors.find((item): boolean => item.name == name && item.type == type);
    if (typeof interceptor === "undefined") {
      throw new Error("No one interceptor with this name is registered.");
    }
    this._interceptors = this._interceptors.filter((item): boolean => item.name != name || item.type != type);

    return this;
  }

  /** Removes every request interceptor, the default ones included. */
  resetRequestInterceptors(): this {
    this._interceptors = this._interceptors.filter((item): boolean => item.type !== "request");

    return this;
  }

  /** Removes every response interceptor. */
  resetResponseInterceptors(): this {
    this._interceptors = this._interceptors.filter((item): boolean => item.type !== "response");

    return this;
  }

  /** Removes every error interceptor, the default one included. */
  resetErrorInterceptors(): this {
    this._interceptors = this._interceptors.filter((item): boolean => item.type !== "error");

    return this;
  }

  /** Removes every interceptor, then adds the default ones again. */
  resetInterceptors(): this {
    this._interceptors = [];

    return this.addDefaultInterceptors();
  }

  /**
   * Sends a request.
   *
   * The interceptors added with `once: true` are removed after the request, whether it succeeds or fails.
   *
   * @throws {@link JsonapiResponseError} for a status outside the 2xx range, with the decoded document when the body is
   *   a JSON:API one.
   * @throws {@link JsonapiNetworkError} when `fetch` fails without a response. An aborted request is thrown as is.
   */
  async request<R extends JsonapiResource>(options: FetchAdapterOptions): Promise<FetchAdapterResponse<R>> {
    try {
      // Copy the client options so that the caller's object is not modified
      let opt: FetchAdapterOptionsWithInit = {
        ...options,
        clientOptions: { ...(options.clientOptions ?? {}) }
      };

      opt = await pipe(opt)
        .through(
          ...this._interceptors
            .filter((item): boolean => item.type === "request")
            .map((item) => (item as RegisteredRequestInterceptor).interceptor)
        )
        .return();

      opt.clientOptions.body = opt.data as BodyInit | null | undefined;
      opt.clientOptions.method = opt.method;

      const fetchResponse = await this.send(JsonapiUrl.asString(opt.url), opt.clientOptions);
      const dictionary = opt.dictionary ?? jsonapiDictionary;
      if (!fetchResponse.ok) {
        throw await this.responseError(fetchResponse, dictionary);
      }

      const json = await this.readJson<DocumentDto<ExtractAttributeType<R>>>(fetchResponse);

      let response: FetchAdapterResponse<R> = {
        status: fetchResponse.status,
        clientResponse: fetchResponse,
        json: json,
        doc: typeof json === "undefined" ? undefined : Deserializer.decode(json, dictionary)
      };

      response = await pipe(response)
        .through(
          ...this._interceptors
            .filter((item): boolean => item.type === "response")
            .map((item) => (item as RegisteredResponseInterceptor).interceptor)
        )
        .return();

      return response;
    } catch (error) {
      throw await pipe(error)
        .through(
          ...this._interceptors
            .filter((item): boolean => item.type === "error")
            .map((item) => (item as RegisteredErrorInterceptor).interceptor)
        )
        .return();
    } finally {
      this._interceptors
        .filter((item): boolean => item.once)
        .forEach((item) => this.removeInterceptor(item.name, item.type));
    }
  }

  /**
   * Calls `fetch`. A network failure becomes a `JsonapiNetworkError`; an aborted request is rethrown as is.
   */
  private async send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      throw new JsonapiNetworkError(error);
    }
  }

  /**
   * Reads the body as JSON. A 204 or an empty body gives `undefined`.
   */
  private async readJson<T = DocumentDto>(response: Response): Promise<T | undefined> {
    if (response.status === 204) {
      return undefined;
    }

    const text = await response.text();

    return text.trim() === "" ? undefined : JSON.parse(text);
  }

  /**
   * Builds the error for a non-2xx response, with the decoded document when the body is a JSON:API one.
   */
  private async responseError(response: Response, dictionary: Dictionary): Promise<JsonapiResponseError<Response>> {
    let document: JsonapiDocument | undefined;

    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.trim().toLowerCase().startsWith("application/vnd.api+json")) {
      try {
        const json = await this.readJson(response);
        document = typeof json === "undefined" ? undefined : Deserializer.decode(json, dictionary);
      } catch {
        // Malformed body: the error keeps the status and the response only
      }
    }

    return new JsonapiResponseError(response.status, response, document);
  }
}
