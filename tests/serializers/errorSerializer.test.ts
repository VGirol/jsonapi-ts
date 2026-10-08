import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import {
  ErrorSerializer,
  ErrorSourceSerializer,
  JsonapiErrorObject,
  LinksSerializer,
  MetaSerializer
} from "../internals";

describe("ErrorSerializer", () => {
  let mockSource: {
    links: { empty: Mock<() => boolean> };
    meta: { empty: Mock<() => boolean> };
    [key: string]: unknown;
  };

  beforeEach(() => {
    mockSource = {
      id: "123",
      status: "404",
      code: "not_found",
      title: "Not Found",
      detail: "Resource not found",
      source: { pointer: "/data/attributes/name" },
      links: { empty: vi.fn().mockReturnValue(true) },
      meta: { empty: vi.fn().mockReturnValue(true) }
    };
    vi.spyOn(ErrorSourceSerializer, "serializeErrorSource").mockReturnValue({
      pointer: "/data/attributes/name",
      parameter: "name"
    });
    vi.spyOn(LinksSerializer, "serializeLinks").mockReturnValue({ self: "link" });
    vi.spyOn(MetaSerializer, "serializeMeta").mockReturnValue({ key: "value" });
  });

  it("should serialize all fields when present", () => {
    mockSource.links.empty.mockReturnValue(false);
    mockSource.meta.empty.mockReturnValue(false);

    const result = ErrorSerializer.serializeError(mockSource as unknown as JsonapiErrorObject);

    expect(result).toEqual({
      id: "123",
      status: "404",
      code: "not_found",
      title: "Not Found",
      detail: "Resource not found",
      source: { pointer: "/data/attributes/name", parameter: "name" },
      links: { self: "link" },
      meta: { key: "value" }
    });
    expect(ErrorSourceSerializer.serializeErrorSource).toHaveBeenCalledWith(mockSource.source);
    expect(LinksSerializer.serializeLinks).toHaveBeenCalledWith(mockSource.links);
    expect(MetaSerializer.serializeMeta).toHaveBeenCalledWith(mockSource.meta);
  });

  it("should omit optional fields if not present", () => {
    mockSource = {
      source: { pointer: "/data/attributes/name", parameter: "name" },
      links: { empty: vi.fn().mockReturnValue(true) },
      meta: { empty: vi.fn().mockReturnValue(true) }
    };
    const result = ErrorSerializer.serializeError(mockSource as unknown as JsonapiErrorObject);

    expect(result).toEqual({
      source: { pointer: "/data/attributes/name", parameter: "name" }
    });
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("code");
    expect(result).not.toHaveProperty("title");
    expect(result).not.toHaveProperty("detail");
    expect(result).not.toHaveProperty("links");
    expect(result).not.toHaveProperty("meta");
  });

  it("should only add links if links is not empty", () => {
    mockSource.links.empty.mockReturnValue(false);
    mockSource.meta.empty.mockReturnValue(true);

    const result = ErrorSerializer.serializeError(mockSource as unknown as JsonapiErrorObject);

    expect(result.links).toEqual({ self: "link" });
    expect(result).not.toHaveProperty("meta");
  });

  it("should only add meta if meta is not empty", () => {
    mockSource.links.empty.mockReturnValue(true);
    mockSource.meta.empty.mockReturnValue(false);

    const result = ErrorSerializer.serializeError(mockSource as unknown as JsonapiErrorObject);

    expect(result.meta).toEqual({ key: "value" });
    expect(result).not.toHaveProperty("links");
  });

  it("should always serialize source", () => {
    const result = ErrorSerializer.serializeError(mockSource as unknown as JsonapiErrorObject);
    expect(ErrorSourceSerializer.serializeErrorSource).toHaveBeenCalledWith(mockSource.source);
    expect(result.source).toEqual({ pointer: "/data/attributes/name", parameter: "name" });
  });
});
