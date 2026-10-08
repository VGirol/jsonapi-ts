import { isString } from "@/support";
import { JsonapiDocument, JsonapiResource } from "@/models";
import { isDocumentWithManyResources, isDocumentWithSingleResource, isUrl } from "@/guards";
import { AdapterContract, AdapterOptions, AdapterResponse } from "@/contracts";
import { JsonapiDocumentCollection, JsonapiDocumentSingle, UrlType } from "@/types";
import { FetchAdapter } from "@/fetch-adapter";
import { JsonapiDocumentError } from "@/errors";
import { Dictionary, jsonapiDictionary } from "@/services";

/**
 * A JSON:API client: sends requests through an adapter and returns decoded documents.
 *
 * The adapter does the HTTP work: {@link FetchAdapter} by default, or `AxiosAdapter` from `@vgirol/jsonapi-axios`. A
 * response outside the 2xx range rejects with a {@link JsonapiResponseError}, and a missing response with a
 * {@link JsonapiNetworkError}.
 *
 * @example
 * ```ts
 * const client = JsonapiHttpClient.make();
 *
 * const doc = await client.getCollection<Article>({
 *   path: "https://api.example.com/articles",
 *   query: { include: ["author"], sort: ["-publishedOn"] }
 * });
 * ```
 */
export class JsonapiHttpClient {
  private _adapter!: AdapterContract;
  private _dictionary: Dictionary;

  /**
   * Creates a client, with the fetch adapter when none is given. Called on a subclass, it creates an instance of the
   * subclass.
   *
   * @param adapter - The adapter (a new {@link FetchAdapter} by default).
   * @param dictionary - The classes to instantiate for each resource type (the shared `jsonapiDictionary` by default).
   */
  static make<T extends JsonapiHttpClient>(
    this: new (adapter: AdapterContract, dictionary?: Dictionary) => T,
    adapter?: AdapterContract,
    dictionary?: Dictionary
  ): T {
    return new this(adapter ?? new FetchAdapter(), dictionary);
  }

  /**
   * @param adapter - Sends the requests and decodes the responses.
   * @param dictionary - The classes to instantiate for each resource type. The shared `jsonapiDictionary` by default;
   *   give a dedicated one when several clients talk to APIs whose resource types could collide.
   */
  constructor(adapter: AdapterContract, dictionary: Dictionary = jsonapiDictionary) {
    this.adapter = adapter;
    this._dictionary = dictionary;
  }

  /** The dictionary used to decode the responses. */
  get dictionary(): Dictionary {
    return this._dictionary;
  }

  /** The adapter that sends the requests. */
  get adapter(): AdapterContract {
    return this._adapter;
  }

  set adapter(adapter: AdapterContract) {
    this._adapter = adapter;
  }

  /**
   * Sends a request and returns the full response of the adapter (status, raw JSON, document, client response).
   *
   * @param options - The request. Its `dictionary`, when missing, is the dictionary of the client.
   */
  async request<R extends JsonapiResource, D = unknown, Opt = unknown>(
    options: AdapterOptions<D, Opt>
  ): Promise<AdapterResponse<R>> {
    return await this.adapter.request<R>({ ...options, dictionary: options.dictionary ?? this.dictionary });
  }

  /**
   * Sends a request and returns the decoded document, if any.
   *
   * @param method - The HTTP method.
   * @param url - The URL, as a string or as {@link UrlOptions} (path and query).
   * @param data - What to send: a model (serialized by the adapter), or a document already serialized.
   * @param clientOptions - Options passed to the HTTP client of the adapter (`RequestInit` for `fetch`).
   * @returns The document, or `undefined` for a response without body (e.g. a 204).
   */
  async send<R extends JsonapiResource, D = unknown, Opt = unknown>(
    method: string,
    url: UrlType,
    data?: D,
    clientOptions?: Opt
  ): Promise<JsonapiDocument<R> | undefined>;
  /**
   * Sends a request and returns the decoded document, if any.
   *
   * @param options - The URL, method, data and client options of the request.
   * @returns The document, or `undefined` for a response without body (e.g. a 204).
   */
  async send<R extends JsonapiResource, D = unknown, Opt = unknown>(
    options: AdapterOptions<D, Opt>
  ): Promise<JsonapiDocument<R> | undefined>;
  async send<R extends JsonapiResource, D = unknown, Opt = unknown>(
    method: string | AdapterOptions<D, Opt>,
    url?: UrlType,
    data?: D,
    clientOptions?: Opt
  ): Promise<JsonapiDocument<R> | undefined> {
    const options: AdapterOptions<D, Opt> = isString(method)
      ? {
          url: url as UrlType,
          method: method,
          data: data,
          clientOptions: clientOptions
        }
      : method;

    const response = await this.request<R>(options);

    return response.doc;
  }

  /**
   * Sends a `GET` request.
   *
   * @param url - The URL, as a string or as {@link UrlOptions} (path and query).
   * @param clientOptions - Options passed to the HTTP client of the adapter (`RequestInit` for `fetch`).
   * @throws {@link JsonapiDocumentError} when the response has no document.
   */
  async get<R extends JsonapiResource, Opt = unknown>(url: UrlType, clientOptions?: Opt): Promise<JsonapiDocument<R>>;
  /**
   * Sends a `GET` request.
   *
   * @param options - The URL, method, data and client options of the request.
   * @throws {@link JsonapiDocumentError} when the response has no document.
   */
  async get<R extends JsonapiResource, Opt = unknown>(options: AdapterOptions<never, Opt>): Promise<JsonapiDocument<R>>;
  async get<R extends JsonapiResource, Opt = unknown>(
    url: UrlType | AdapterOptions<never, Opt>,
    clientOptions?: Opt
  ): Promise<JsonapiDocument<R>> {
    const options: AdapterOptions<never, Opt> = isUrl(url)
      ? {
          url: url,
          method: "GET",
          clientOptions: clientOptions
        }
      : url;

    const doc = await this.send<R, never, Opt>(options);
    if (typeof doc === "undefined") {
      throw new JsonapiDocumentError("API error : No document returned.");
    }

    return doc;
  }

  /**
   * Fetches a single resource.
   *
   * @param url - The URL, as a string or as {@link UrlOptions} (path and query).
   * @param clientOptions - Options passed to the HTTP client of the adapter (`RequestInit` for `fetch`).
   * @throws {@link JsonapiDocumentError} when the primary data is not a single resource.
   */
  async getSingle<R extends JsonapiResource, Opt = unknown>(
    url: UrlType,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentSingle<R>>;
  /**
   * Fetches a single resource.
   *
   * @param options - The URL, method, data and client options of the request.
   * @throws {@link JsonapiDocumentError} when the primary data is not a single resource.
   */
  async getSingle<R extends JsonapiResource, Opt = unknown>(
    options: AdapterOptions<never, Opt>
  ): Promise<JsonapiDocumentSingle<R>>;
  async getSingle<R extends JsonapiResource, Opt = unknown>(
    url: UrlType | AdapterOptions<never, Opt>,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentSingle<R>> {
    const options: AdapterOptions<never, Opt> = isUrl(url)
      ? {
          url: url,
          method: "GET",
          clientOptions: clientOptions
        }
      : url;

    const doc = await this.get<R, Opt>(options);
    if (!isDocumentWithSingleResource<R>(doc)) {
      throw new JsonapiDocumentError("API error : Not single resource.", doc);
    }

    return doc;
  }

  /**
   * Fetches a collection of resources.
   *
   * @param url - The URL, as a string or as {@link UrlOptions} (path and query).
   * @param clientOptions - Options passed to the HTTP client of the adapter (`RequestInit` for `fetch`).
   * @throws {@link JsonapiDocumentError} when the primary data is not an array of resources.
   */
  async getCollection<R extends JsonapiResource, Opt = unknown>(
    url: UrlType,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentCollection<R>>;
  /**
   * Fetches a collection of resources.
   *
   * @param options - The URL, method, data and client options of the request.
   * @throws {@link JsonapiDocumentError} when the primary data is not an array of resources.
   */
  async getCollection<R extends JsonapiResource, Opt = unknown>(
    options: AdapterOptions<never, Opt>
  ): Promise<JsonapiDocumentCollection<R>>;
  async getCollection<R extends JsonapiResource, Opt = unknown>(
    url: UrlType | AdapterOptions<never, Opt>,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentCollection<R>> {
    const options: AdapterOptions<never, Opt> = isUrl(url)
      ? {
          url: url,
          method: "GET",
          clientOptions: clientOptions
        }
      : url;

    const doc = await this.get<R, Opt>(options);
    if (!isDocumentWithManyResources<R>(doc)) {
      throw new JsonapiDocumentError("API error : Not collection of resources.", doc);
    }

    return doc;
  }

  /**
   * Updates a resource with a `PATCH` request.
   *
   * @param url - The URL, as a string or as {@link UrlOptions} (path and query).
   * @param data - What to send: a model (serialized by the adapter), or a document already serialized.
   * @param clientOptions - Options passed to the HTTP client of the adapter (`RequestInit` for `fetch`).
   * @throws Error when no data is given.
   * @throws {@link JsonapiDocumentError} when the response is not a single resource.
   */
  async patch<R extends JsonapiResource, D = unknown, Opt = unknown>(
    url: UrlType,
    data?: D,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentSingle<R>>;
  /**
   * Updates a resource with a `PATCH` request.
   *
   * @param options - The URL, method, data and client options of the request.
   * @throws Error when no data is given.
   * @throws {@link JsonapiDocumentError} when the response is not a single resource.
   */
  async patch<R extends JsonapiResource, D = unknown, Opt = unknown>(
    options: AdapterOptions<D, Opt>
  ): Promise<JsonapiDocumentSingle<R>>;
  async patch<R extends JsonapiResource, D = unknown, Opt = unknown>(
    url: UrlType | AdapterOptions<D, Opt>,
    data?: D,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentSingle<R>> {
    const options: AdapterOptions<D, Opt> = isUrl(url)
      ? {
          url: url,
          method: "PATCH",
          data: data,
          clientOptions: clientOptions
        }
      : url;
    if (typeof options.data === "undefined") {
      throw new Error("No data provided.");
    }

    const doc = await this.send<R, D, Opt>(options);
    if (!isDocumentWithSingleResource<R>(doc)) {
      throw new JsonapiDocumentError("API error : Not single resource.", doc);
    }

    return doc;
  }

  /**
   * Creates a resource with a `POST` request.
   *
   * @param url - The URL, as a string or as {@link UrlOptions} (path and query).
   * @param data - What to send: a model (serialized by the adapter), or a document already serialized.
   * @param clientOptions - Options passed to the HTTP client of the adapter (`RequestInit` for `fetch`).
   * @throws Error when no data is given.
   * @throws {@link JsonapiDocumentError} when the response is not a single resource.
   */
  async post<R extends JsonapiResource, D = unknown, Opt = unknown>(
    url: UrlType,
    data: D,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentSingle<R>>;
  /**
   * Creates a resource with a `POST` request.
   *
   * @param options - The URL, method, data and client options of the request.
   * @throws Error when no data is given.
   * @throws {@link JsonapiDocumentError} when the response is not a single resource.
   */
  async post<R extends JsonapiResource, D = unknown, Opt = unknown>(
    options: AdapterOptions<D, Opt>
  ): Promise<JsonapiDocumentSingle<R>>;
  async post<R extends JsonapiResource, D = unknown, Opt = unknown>(
    url: UrlType | AdapterOptions<D, Opt>,
    data?: D,
    clientOptions?: Opt
  ): Promise<JsonapiDocumentSingle<R>> {
    const options: AdapterOptions<D, Opt> = isUrl(url)
      ? {
          url: url,
          method: "POST",
          data: data,
          clientOptions: clientOptions
        }
      : url;
    if (typeof options.data === "undefined") {
      throw new Error("No data provided.");
    }

    const doc = await this.send<R, D, Opt>(options);
    if (!isDocumentWithSingleResource<R>(doc)) {
      throw new JsonapiDocumentError("API error : Not single resource.", doc);
    }

    return doc;
  }

  /**
   * Deletes a resource with a `DELETE` request.
   *
   * @param url - The URL, as a string or as {@link UrlOptions} (path and query).
   * @param clientOptions - Options passed to the HTTP client of the adapter (`RequestInit` for `fetch`).
   * @returns The document of the response, usually `undefined` (204 No Content).
   */
  async delete<Opt = unknown>(url: UrlType, clientOptions?: Opt): Promise<unknown>;
  /**
   * Deletes a resource with a `DELETE` request.
   *
   * @param options - The URL, method, data and client options of the request.
   * @returns The document of the response, usually `undefined` (204 No Content).
   */
  async delete<Opt = unknown>(options: AdapterOptions<never, Opt>): Promise<unknown>;
  async delete<Opt = unknown>(url: UrlType | AdapterOptions<never, Opt>, clientOptions?: Opt): Promise<unknown> {
    const options: AdapterOptions<never, Opt> = isUrl(url)
      ? {
          url: url,
          method: "DELETE",
          clientOptions: clientOptions
        }
      : url;

    return await this.send<never, never, Opt>(options);
  }
}
