import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonapiDeserializer, JsonapiDto, JsonapiJsonapi, MetaDeserializer } from "../internals";

describe("JsonapiDeserializer", () => {
  let jsonapi: JsonapiJsonapi;
  let source: JsonapiDto;

  beforeEach(() => {
    jsonapi = {
      setVersion: vi.fn(),
      meta: {}
    } as unknown as JsonapiJsonapi;
    source = {};
    vi.restoreAllMocks();
  });

  it("should call setVersion if source.version is present", () => {
    source.version = "1.0";
    JsonapiDeserializer.decodeJsonapi(jsonapi, source);
    expect(jsonapi.setVersion).toHaveBeenCalledWith("1.0");
  });

  it("should not call setVersion if source.version is not present", () => {
    JsonapiDeserializer.decodeJsonapi(jsonapi, source);
    expect(jsonapi.setVersion).not.toHaveBeenCalled();
  });

  it("should call MetaDeserializer.decodeMeta if source.meta is present", () => {
    const meta = { foo: "bar" };
    source.meta = meta;
    const decodeMetaSpy = vi.spyOn(MetaDeserializer, "decodeMeta").mockImplementation(() => {});
    JsonapiDeserializer.decodeJsonapi(jsonapi, source);
    expect(decodeMetaSpy).toHaveBeenCalledWith(jsonapi.meta, meta);
  });

  it("should not call MetaDeserializer.decodeMeta if source.meta is not present", () => {
    const decodeMetaSpy = vi.spyOn(MetaDeserializer, "decodeMeta").mockImplementation(() => {});
    JsonapiDeserializer.decodeJsonapi(jsonapi, source);
    expect(decodeMetaSpy).not.toHaveBeenCalled();
  });
});
