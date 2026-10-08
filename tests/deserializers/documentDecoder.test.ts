import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DataDeserializer,
  DocumentDeserializer,
  ErrorsDeserializer,
  JsonapiDeserializer,
  DocumentDto,
  JsonapiDocument,
  jsonapiDictionary,
  LinksDeserializer,
  MetaDeserializer,
  ResourceDeserializer
} from "../internals";

// Mock dependencies
vi.mock("@/deserializers/metaDeserializer", () => ({
  MetaDeserializer: { decodeMeta: vi.fn() }
}));
vi.mock("@/deserializers/errorsDeserializer", () => ({
  ErrorsDeserializer: { decodeErrors: vi.fn() }
}));
vi.mock("@/deserializers/linksDeserializer", () => ({
  LinksDeserializer: { decodeLinks: vi.fn() }
}));
vi.mock("@/deserializers/jsonapiDeserializer", () => ({
  JsonapiDeserializer: { decodeJsonapi: vi.fn() }
}));
vi.mock("@/deserializers/dataDeserializer", () => ({
  DataDeserializer: { decodeData: vi.fn() }
}));
vi.mock("@/deserializers/resourceDeserializer", () => ({
  ResourceDeserializer: { decodeResource: vi.fn((item) => ({ ...item, decoded: true })) }
}));

describe("DocumentDeserializer", () => {
  let doc: JsonapiDocument;
  let source: DocumentDto;

  beforeEach(() => {
    doc = {
      meta: {},
      jsonapi: {},
      links: {},
      dataObject: {},
      included: [],
      errors: [],
      createResourceTree: vi.fn()
    } as unknown as JsonapiDocument;
    source = {};
    vi.clearAllMocks();
  });

  it("should decode meta if present", () => {
    source.meta = { foo: "bar" };
    DocumentDeserializer.decodeDocument(doc, source);
    expect(MetaDeserializer.decodeMeta).toHaveBeenCalledWith(doc.meta, source.meta);
  });

  it("should decode jsonapi if present", () => {
    source.jsonapi = { version: "1.0" };
    DocumentDeserializer.decodeDocument(doc, source);
    expect(JsonapiDeserializer.decodeJsonapi).toHaveBeenCalledWith(doc.jsonapi, source.jsonapi);
  });

  it("should decode links if present", () => {
    source.links = { self: "/test" };
    DocumentDeserializer.decodeDocument(doc, source);
    expect(LinksDeserializer.decodeLinks).toHaveBeenCalledWith(doc.links, source.links);
  });

  it("should decode data if present", () => {
    source.data = { id: "1", type: "mock" };
    DocumentDeserializer.decodeDocument(doc, source);
    expect(DataDeserializer.decodeData).toHaveBeenCalledWith(doc.dataObject, source.data, jsonapiDictionary);
  });

  it("should decode included resources and call createResourceTree", () => {
    source.included = [
      { id: "2", type: "mock" },
      { id: "3", type: "mock" }
    ];
    DocumentDeserializer.decodeDocument(doc, source);
    expect(ResourceDeserializer.decodeResource).toHaveBeenCalledTimes(2);
    expect(doc.included).toEqual([
      { id: "2", type: "mock", decoded: true },
      { id: "3", type: "mock", decoded: true }
    ]);
    expect(doc.createResourceTree).toHaveBeenCalled();
  });

  it("should decode errors if present", () => {
    source.errors = [{ title: "Error" }];
    DocumentDeserializer.decodeDocument(doc, source);
    expect(ErrorsDeserializer.decodeErrors).toHaveBeenCalledWith(doc.errors, source.errors);
  });

  it("should return the doc object", () => {
    const result = DocumentDeserializer.decodeDocument(doc, source);
    expect(result).toBe(doc);
  });

  it("should not call any decoders if properties are missing", () => {
    DocumentDeserializer.decodeDocument(doc, source);
    expect(MetaDeserializer.decodeMeta).not.toHaveBeenCalled();
    expect(JsonapiDeserializer.decodeJsonapi).not.toHaveBeenCalled();
    expect(LinksDeserializer.decodeLinks).not.toHaveBeenCalled();
    expect(DataDeserializer.decodeData).not.toHaveBeenCalled();
    expect(ResourceDeserializer.decodeResource).not.toHaveBeenCalled();
    expect(ErrorsDeserializer.decodeErrors).not.toHaveBeenCalled();
    expect(doc.createResourceTree).not.toHaveBeenCalled();
  });
});
