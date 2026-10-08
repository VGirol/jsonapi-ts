import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ErrorDeserializer,
  ErrorDto,
  ErrorSourceDeserializer,
  JsonapiErrorObject,
  LinksDeserializer,
  MetaDeserializer
} from "../internals";

vi.mock("@/deserializers/linksDeserializer", () => ({
  LinksDeserializer: {
    decodeLinks: vi.fn()
  }
}));
vi.mock("@/deserializers/errorSourceDeserializer", () => ({
  ErrorSourceDeserializer: {
    decodeErrorSource: vi.fn()
  }
}));
vi.mock("@/deserializers/metaDeserializer", () => ({
  MetaDeserializer: {
    decodeMeta: vi.fn()
  }
}));

describe("ErrorDeserializer", () => {
  let error: JsonapiErrorObject;
  let source: ErrorDto;

  beforeEach(() => {
    error = new JsonapiErrorObject();
    source = {};
    vi.clearAllMocks();
  });

  it("should decode id, status, code, title, and detail", () => {
    source = {
      id: "123",
      status: "404",
      code: "not_found",
      title: "Not Found",
      detail: "Resource not found"
    };
    ErrorDeserializer.decodeError(error, source);
    expect(error.id).toBe("123");
    expect(error.status).toBe("404");
    expect(error.code).toBe("not_found");
    expect(error.title).toBe("Not Found");
    expect(error.detail).toBe("Resource not found");
  });

  it("should call LinksDeserializer.decodeLinks if links is present", () => {
    source.links = { self: "url" };
    ErrorDeserializer.decodeError(error, source);
    expect(LinksDeserializer.decodeLinks).toHaveBeenCalledWith(error.links, source.links);
  });

  it("should call ErrorSourceDeserializer.decodeErrorSource if source is present", () => {
    source.source = { pointer: "/data", parameter: "test" };
    ErrorDeserializer.decodeError(error, source);
    expect(ErrorSourceDeserializer.decodeErrorSource).toHaveBeenCalledWith(error.source, source.source);
  });

  it("should call MetaDeserializer.decodeMeta if meta is present", () => {
    source.meta = { foo: "bar" };
    ErrorDeserializer.decodeError(error, source);
    expect(MetaDeserializer.decodeMeta).toHaveBeenCalledWith(error.meta, source.meta);
  });

  it("should not set fields if they are not present in source", () => {
    ErrorDeserializer.decodeError(error, source);
    expect(error.id).toBeUndefined();
    expect(error.status).toBeUndefined();
    expect(error.code).toBeUndefined();
    expect(error.title).toBeUndefined();
    expect(error.detail).toBeUndefined();
    expect(LinksDeserializer.decodeLinks).not.toHaveBeenCalled();
    expect(ErrorSourceDeserializer.decodeErrorSource).not.toHaveBeenCalled();
    expect(MetaDeserializer.decodeMeta).not.toHaveBeenCalled();
  });
});
