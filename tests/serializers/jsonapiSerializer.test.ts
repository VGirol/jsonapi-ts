import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { JsonapiSerializer, JsonapiJsonapi, MetaSerializer } from "../internals";

describe("JsonapiSerializer", () => {
  let mockMeta: { empty: Mock<() => boolean> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockMeta = {
      empty: vi.fn()
    };
  });

  it("should serialize version when present", () => {
    mockMeta.empty.mockReturnValue(true);
    const source: JsonapiJsonapi = {
      version: "1.0",
      meta: mockMeta
    } as unknown as JsonapiJsonapi;

    const result = JsonapiSerializer.serializeJsonapi(source);

    expect(result).toHaveProperty("version", "1.0");
    expect(result).not.toHaveProperty("meta");
  });

  it("should serialize meta when not empty", () => {
    mockMeta.empty.mockReturnValue(false);
    const encodedMeta = { foo: "bar" };
    vi.spyOn(MetaSerializer, "serializeMeta").mockReturnValue(encodedMeta);

    const source: JsonapiJsonapi = {
      meta: mockMeta
    } as unknown as JsonapiJsonapi;

    const result = JsonapiSerializer.serializeJsonapi(source);

    expect(result).toHaveProperty("meta", encodedMeta);
    expect(MetaSerializer.serializeMeta).toHaveBeenCalledWith(mockMeta);
  });

  it("should not serialize meta when empty", () => {
    mockMeta.empty.mockReturnValue(true);
    const serializeMetaSpy = vi.spyOn(MetaSerializer, "serializeMeta");

    const source: JsonapiJsonapi = {
      meta: mockMeta
    } as unknown as JsonapiJsonapi;

    const result = JsonapiSerializer.serializeJsonapi(source);

    expect(result).not.toHaveProperty("meta");
    expect(serializeMetaSpy).not.toHaveBeenCalled();
  });

  it("should return an empty object if no version and meta is empty", () => {
    mockMeta.empty.mockReturnValue(true);

    const source: JsonapiJsonapi = {
      meta: mockMeta
    } as unknown as JsonapiJsonapi;

    const result = JsonapiSerializer.serializeJsonapi(source);

    expect(result).toEqual({});
  });

  it("should serialize both version and meta when both are present", () => {
    mockMeta.empty.mockReturnValue(false);
    const encodedMeta = { bar: "baz" };
    vi.spyOn(MetaSerializer, "serializeMeta").mockReturnValue(encodedMeta);

    const source: JsonapiJsonapi = {
      version: "2.0",
      meta: mockMeta
    } as unknown as JsonapiJsonapi;

    const result = JsonapiSerializer.serializeJsonapi(source);

    expect(result).toEqual({
      version: "2.0",
      meta: encodedMeta
    });
  });
});
