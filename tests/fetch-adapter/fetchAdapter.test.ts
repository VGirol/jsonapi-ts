import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FetchAdapter } from "../../src/fetch-adapter";
import { JsonapiError, JsonapiNetworkError, JsonapiResponseError } from "../../src/errors";
import { JsonapiResource } from "../../src/models";
import { Dictionary } from "../../src/services";
import { FetchAdapterOptions } from "../../src/fetch-adapter/types";

const JSONAPI = "application/vnd.api+json";

const jsonapiResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status: status, headers: { "Content-Type": JSONAPI } });

const mockFetch = (response: Response | Error) => {
  const fetchMock =
    response instanceof Error ? vi.fn().mockRejectedValue(response) : vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

const sentInit = (fetchMock: ReturnType<typeof vi.fn>, call = 0): RequestInit => fetchMock.mock.calls[call][1];

const sentHeaders = (fetchMock: ReturnType<typeof vi.fn>, call = 0): Headers =>
  sentInit(fetchMock, call).headers as Headers;

const get = (): FetchAdapterOptions => ({ url: "http://test.com/api/tests/1", method: "GET" });

describe("FetchAdapter.request", () => {
  let adapter: FetchAdapter;

  beforeEach(() => {
    adapter = new FetchAdapter();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("successful responses", () => {
    it("decodes a 200 response with a document", async () => {
      const body = { data: { type: "test", id: "1", attributes: { name: "foo" } } };
      const fetchMock = mockFetch(jsonapiResponse(body));

      const result = await adapter.request(get());

      expect(result.status).toBe(200);
      expect(result.json).toEqual(body);
      expect(result.clientResponse).toBeInstanceOf(Response);
      expect(result.doc?.dataAsResource.id).toBe("1");
      expect(result.doc?.dataAsResource.type).toBe("test");
      expect(fetchMock).toHaveBeenCalledWith("http://test.com/api/tests/1", expect.objectContaining({ method: "GET" }));
    });

    it("decodes the document with the dictionary of the options", async () => {
      class Article extends JsonapiResource {}
      const dictionary = new Dictionary();
      dictionary.add("articles", Article);
      mockFetch(jsonapiResponse({ data: { type: "articles", id: "1", attributes: {} } }));

      const result = await adapter.request({ ...get(), dictionary: dictionary });

      expect(result.doc?.dataAsResource).toBeInstanceOf(Article);
    });

    it("sends a GET without body and without Content-Type", async () => {
      const fetchMock = mockFetch(jsonapiResponse({ data: null }));

      await adapter.request(get());

      expect(sentInit(fetchMock).body).toBeUndefined();
      expect(sentHeaders(fetchMock).get("Accept")).toBe(JSONAPI);
      expect(sentHeaders(fetchMock).has("Content-Type")).toBe(false);
    });

    it("serializes the resource of a POST and decodes the 201 response", async () => {
      const body = { data: { type: "test", id: "12", attributes: { name: "foo" } } };
      const fetchMock = mockFetch(jsonapiResponse(body, 201));

      const result = await adapter.request({
        url: "http://test.com/api/tests",
        method: "POST",
        data: JsonapiResource.from("test", "", { name: "foo" })
      });

      expect(result.status).toBe(201);
      expect(result.doc?.dataAsResource.id).toBe("12");
      expect(sentHeaders(fetchMock).get("Content-Type")).toBe(JSONAPI);
      expect(JSON.parse(sentInit(fetchMock).body as string)).toMatchObject({
        data: { type: "test", attributes: { name: "foo" } }
      });
    });

    it("sends a document already serialized as JSON", async () => {
      const fetchMock = mockFetch(jsonapiResponse({ data: { type: "test", id: "12", attributes: {} } }, 201));
      const dto = { data: { type: "test", attributes: { name: "foo" } } };

      await adapter.request({ url: "http://test.com/api/tests", method: "POST", data: dto });

      expect(sentInit(fetchMock).body).toBe(JSON.stringify(dto));
      expect(sentHeaders(fetchMock).get("Content-Type")).toBe(JSONAPI);
    });

    it("sends a FormData as is, without the JSON:API content type", async () => {
      const fetchMock = mockFetch(jsonapiResponse({ data: null }));
      const form = new FormData();
      form.append("name", "foo");

      await adapter.request({ url: "http://test.com/api/uploads", method: "POST", data: form });

      expect(sentInit(fetchMock).body).toBe(form);
      expect(sentHeaders(fetchMock).has("Content-Type")).toBe(false);
    });

    it("gives no document for a 204", async () => {
      mockFetch(new Response(null, { status: 204 }));

      const result = await adapter.request({ url: "http://test.com/api/tests/1", method: "DELETE" });

      expect(result.status).toBe(204);
      expect(result.json).toBeUndefined();
      expect(result.doc).toBeUndefined();
    });

    it("gives no document for an empty body", async () => {
      mockFetch(new Response("", { status: 200 }));

      const result = await adapter.request({ url: "http://test.com/api/tests/1", method: "DELETE" });

      expect(result.doc).toBeUndefined();
    });
  });

  describe("headers and options", () => {
    it("keeps the Accept and Content-Type headers given by the caller", async () => {
      const fetchMock = mockFetch(jsonapiResponse({ data: null }));
      const accept = `${JSONAPI}; ext="https://jsonapi.org/ext/atomic"`;

      await adapter.request({
        url: "http://test.com/api/tests",
        method: "POST",
        data: JsonapiResource.from("test", "", { name: "foo" }),
        clientOptions: { headers: { Accept: accept, "Content-Type": accept, Authorization: "Bearer token" } }
      });

      const headers = sentHeaders(fetchMock);
      expect(headers.get("Accept")).toBe(accept);
      expect(headers.get("Content-Type")).toBe(accept);
      expect(headers.get("Authorization")).toBe("Bearer token");
    });

    it("does not modify the client options of the caller", async () => {
      mockFetch(jsonapiResponse({ data: null }));
      const clientOptions: RequestInit = { headers: { Authorization: "Bearer token" } };

      await adapter.request({
        url: "http://test.com/api/tests",
        method: "POST",
        data: JsonapiResource.from("test", "", { name: "foo" }),
        clientOptions: clientOptions
      });

      expect(clientOptions).toEqual({ headers: { Authorization: "Bearer token" } });
    });

    it("sends the method set by a request interceptor", async () => {
      const fetchMock = mockFetch(jsonapiResponse({ data: null }));
      adapter.addRequestInterceptor({ name: "method", interceptor: (opt) => ({ ...opt, method: "HEAD" }) });

      await adapter.request(get());

      expect(sentInit(fetchMock).method).toBe("HEAD");
    });
  });

  describe("error responses", () => {
    it("throws a JsonapiResponseError without document for a 404 without JSON:API body", async () => {
      mockFetch(new Response("<h1>Not found</h1>", { status: 404, headers: { "Content-Type": "text/html" } }));

      const error = await adapter.request(get()).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(JsonapiResponseError);
      expect((error as JsonapiResponseError<Response>).status).toBe(404);
      expect((error as JsonapiResponseError<Response>).document).toBeUndefined();
      expect((error as JsonapiResponseError<Response>).response).toBeInstanceOf(Response);
    });

    it("decodes the errors of a 422", async () => {
      mockFetch(
        jsonapiResponse(
          {
            errors: [
              {
                status: "422",
                title: "Invalid attribute",
                detail: "The name is required.",
                source: { pointer: "/data/attributes/name" }
              }
            ]
          },
          422
        )
      );

      const error = (await adapter.request(get()).catch((e: unknown) => e)) as JsonapiResponseError<Response>;

      expect(error).toBeInstanceOf(JsonapiResponseError);
      expect(error.status).toBe(422);
      expect(error.response.status).toBe(422);
      const errors = error.document?.errors.all() ?? [];
      expect(errors).toHaveLength(1);
      expect(errors[0].detail).toBe("The name is required.");
      expect(errors[0].source.pointer).toBe("/data/attributes/name");
    });

    it("keeps the status when the JSON:API body is malformed", async () => {
      mockFetch(new Response("{not json", { status: 500, headers: { "Content-Type": JSONAPI } }));

      const error = (await adapter.request(get()).catch((e: unknown) => e)) as JsonapiResponseError<Response>;

      expect(error).toBeInstanceOf(JsonapiResponseError);
      expect(error.status).toBe(500);
      expect(error.document).toBeUndefined();
    });

    it("wraps a network error in a JsonapiNetworkError", async () => {
      const networkError = new TypeError("Failed to fetch");
      mockFetch(networkError);

      const error = await adapter.request(get()).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(JsonapiNetworkError);
      expect(error).toBeInstanceOf(JsonapiError);
      expect((error as JsonapiNetworkError).cause).toBe(networkError);
    });

    it("rethrows an aborted request as is", async () => {
      const abort = new DOMException("The operation was aborted.", "AbortError");
      mockFetch(abort);

      await expect(adapter.request(get())).rejects.toBe(abort);
    });

    it("makes every response error a JsonapiError", async () => {
      mockFetch(new Response(null, { status: 500 }));

      const error = await adapter.request(get()).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(JsonapiError);
      expect((error as Error).name).toBe("JsonapiResponseError");
    });
  });

  describe("interceptors", () => {
    it("runs the request interceptors after the default ones, in the order they were added", async () => {
      mockFetch(jsonapiResponse({ data: null }));
      const calls: string[] = [];
      adapter.addRequestInterceptors([
        {
          name: "first",
          interceptor: (opt) => {
            calls.push(`first:${new Headers(opt.clientOptions.headers).get("Accept")}`);
            return opt;
          }
        },
        { name: "second", interceptor: (opt) => (calls.push("second"), opt) }
      ]);

      await adapter.request(get());

      expect(calls).toEqual([`first:${JSONAPI}`, "second"]);
    });

    it("runs the response interceptors in the order they were added", async () => {
      mockFetch(jsonapiResponse({ data: null }));
      const calls: string[] = [];
      adapter.addResponseInterceptors([
        { name: "first", interceptor: (res) => (calls.push("first"), res) },
        { name: "second", interceptor: (res) => (calls.push("second"), res) }
      ]);

      await adapter.request(get());

      expect(calls).toEqual(["first", "second"]);
    });

    it("runs every error interceptor, each one receiving the result of the previous one", async () => {
      mockFetch(new Response(null, { status: 500 }));
      const replaced = new Error("replaced");
      const second = vi.fn(() => replaced);
      adapter.addErrorInterceptors([
        { name: "first", interceptor: (error) => error },
        { name: "second", interceptor: second }
      ]);

      await expect(adapter.request(get())).rejects.toBe(replaced);
      expect(second).toHaveBeenCalledWith(expect.any(JsonapiResponseError));
    });

    it("runs a once interceptor for the next request only", async () => {
      const fetchMock = mockFetch(jsonapiResponse({ data: null }));
      fetchMock.mockImplementation(() => Promise.resolve(jsonapiResponse({ data: null })));
      const once = vi.fn((opt) => opt);
      adapter.addRequestInterceptor({ name: "once", interceptor: once, once: true });

      await adapter.request(get());
      await adapter.request(get());

      expect(once).toHaveBeenCalledTimes(1);
      expect(() => adapter.removeRequestInterceptor("once")).toThrow();
      expect(() => adapter.removeRequestInterceptor("request-header")).not.toThrow();
    });

    it("removes a once interceptor after a failed request", async () => {
      mockFetch(new Response(null, { status: 500 }));
      adapter.addErrorInterceptor({ name: "once", interceptor: (error) => error, once: true });

      await expect(adapter.request(get())).rejects.toBeInstanceOf(JsonapiResponseError);

      expect(() => adapter.removeErrorInterceptor("once")).toThrow();
    });

    it("can remove a default interceptor by its name", async () => {
      const fetchMock = mockFetch(jsonapiResponse({ data: null }));
      adapter.removeRequestInterceptor("request-header");

      await adapter.request(get());

      expect(sentInit(fetchMock).headers).toBeUndefined();
    });
  });
});
