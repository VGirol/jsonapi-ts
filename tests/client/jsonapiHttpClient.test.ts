import { describe, it, expect } from "vitest";
import { JsonapiHttpClient } from "../../src/client";
import { FetchAdapter } from "../../src/fetch-adapter";
import { AdapterContract, AdapterOptions, AdapterResponse } from "../../src/contracts";
import { Deserializer } from "../../src/deserializers";
import { JsonapiDocumentError, JsonapiError } from "../../src/errors";
import { JsonapiResource } from "../../src/models";
import { Dictionary, jsonapiDictionary } from "../../src/services";
import { DocumentDto } from "../../src/types";

const adapterReturning = (json?: DocumentDto): AdapterContract => ({
  request: async <R extends JsonapiResource>(): Promise<AdapterResponse<R>> => ({
    status: typeof json === "undefined" ? 204 : 200,
    clientResponse: undefined,
    json: json as AdapterResponse<R>["json"],
    doc: typeof json === "undefined" ? undefined : Deserializer.decode<R>(json as AdapterResponse<R>["json"] & object)
  })
});

const single: DocumentDto = { data: { type: "test", id: "1", attributes: {} } };
const collection: DocumentDto = { data: [{ type: "test", id: "1", attributes: {} }] };

const documentError = async (promise: Promise<unknown>): Promise<JsonapiDocumentError> => {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(JsonapiDocumentError);
  expect(error).toBeInstanceOf(JsonapiError);

  return error as JsonapiDocumentError;
};

describe("JsonapiHttpClient errors", () => {
  it("throws a JsonapiDocumentError when a GET returns no document", async () => {
    const client = new JsonapiHttpClient(adapterReturning());

    const error = await documentError(client.get("http://test.com/api/tests/1"));

    expect(error.message).toBe("API error : No document returned.");
    expect(error.document).toBeUndefined();
  });

  it("throws a JsonapiDocumentError carrying the document when getSingle receives a collection", async () => {
    const client = new JsonapiHttpClient(adapterReturning(collection));

    const error = await documentError(client.getSingle("http://test.com/api/tests/1"));

    expect(error.message).toBe("API error : Not single resource.");
    expect(error.document?.data).toHaveLength(1);
  });

  it("throws a JsonapiDocumentError when getCollection receives a single resource", async () => {
    const client = new JsonapiHttpClient(adapterReturning(single));

    const error = await documentError(client.getCollection("http://test.com/api/tests"));

    expect(error.message).toBe("API error : Not collection of resources.");
  });

  it("throws a JsonapiDocumentError when a POST or a PATCH returns no single resource", async () => {
    const client = new JsonapiHttpClient(adapterReturning());
    const resource = JsonapiResource.from("test", "1", {});

    await documentError(client.post("http://test.com/api/tests", resource));
    await documentError(client.patch("http://test.com/api/tests/1", resource));
  });

  it("accepts a DELETE without document", async () => {
    const client = new JsonapiHttpClient(adapterReturning());

    await expect(client.delete("http://test.com/api/tests/1")).resolves.toBeUndefined();
  });
});

describe("JsonapiHttpClient dictionary", () => {
  const capturingAdapter = () => {
    const options: AdapterOptions[] = [];
    const adapter: AdapterContract = {
      request: async <R extends JsonapiResource>(opt: AdapterOptions): Promise<AdapterResponse<R>> => {
        options.push(opt);
        return { status: 204, clientResponse: undefined };
      }
    };

    return { adapter, options };
  };

  it("passes the shared dictionary to the adapter by default", async () => {
    const { adapter, options } = capturingAdapter();
    const client = new JsonapiHttpClient(adapter);

    await client.delete("http://test.com/api/tests/1");

    expect(client.dictionary).toBe(jsonapiDictionary);
    expect(options[0].dictionary).toBe(jsonapiDictionary);
  });

  it("passes its own dictionary to the adapter", async () => {
    const { adapter, options } = capturingAdapter();
    const dictionary = new Dictionary();
    const client = JsonapiHttpClient.make(adapter, dictionary);

    await client.delete("http://test.com/api/tests/1");

    expect(options[0].dictionary).toBe(dictionary);
  });

  it("keeps a dictionary given with the request options", async () => {
    const { adapter, options } = capturingAdapter();
    const dictionary = new Dictionary();
    const client = new JsonapiHttpClient(adapter, new Dictionary());

    await client.request({ url: "http://test.com/api/tests/1", method: "GET", dictionary: dictionary });

    expect(options[0].dictionary).toBe(dictionary);
  });
});

describe("JsonapiHttpClient.make", () => {
  it("creates a client with the fetch adapter by default", () => {
    const client = JsonapiHttpClient.make();

    expect(client.adapter).toBeInstanceOf(FetchAdapter);
    expect(client.dictionary).toBe(jsonapiDictionary);
  });

  it("creates an instance of the subclass it is called on", () => {
    class MyClient extends JsonapiHttpClient {}

    expect(MyClient.make()).toBeInstanceOf(MyClient);
  });
});
