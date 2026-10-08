import { describe, it, expect, vi, afterEach } from "vitest";
import {
  Deserializer,
  DocumentDeserializer,
  DocumentDto,
  JsonapiDocument,
  jsonapiDictionary,
  JsonapiResource
} from "../internals";

// Mock dependencies
vi.mock("@/deserializers/documentDeserializer", () => ({
  DocumentDeserializer: {
    decodeDocument: vi.fn((doc, src) => ({ doc, src }))
  }
}));

class TestResource extends JsonapiResource {
  id = "1";
  type = "test";
}

describe("Deserializer", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should decode a DocumentDto object", () => {
    const dto: DocumentDto = { data: { id: "1", type: "test", attributes: { foo: "bar" } } };
    const result = Deserializer.decode<TestResource>(dto);

    expect(DocumentDeserializer.decodeDocument).toHaveBeenCalledWith(
      expect.any(JsonapiDocument),
      dto,
      jsonapiDictionary
    );
    expect(result).toHaveProperty("doc");
    expect(result).toHaveProperty("src", dto);
  });

  it("should decode a JSON string", () => {
    const dto: DocumentDto = { data: { id: "2", type: "test", attributes: { foo: "baz" } } };
    const json = JSON.stringify(dto);

    const result = Deserializer.decode<TestResource>(json);

    expect(DocumentDeserializer.decodeDocument).toHaveBeenCalledWith(
      expect.any(JsonapiDocument),
      dto,
      jsonapiDictionary
    );
    expect(result).toHaveProperty("src");
    expect(result.src).toEqual(dto);
  });

  it("should throw if invalid JSON string is provided", () => {
    expect(() => Deserializer.decode<TestResource>("not a json")).toThrow();
  });
});
