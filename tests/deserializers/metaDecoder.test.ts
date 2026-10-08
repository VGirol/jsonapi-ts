import { describe, it, expect, vi } from "vitest";
import { JsonapiMeta, MetaDeserializer, MetaDto } from "../internals";

describe("MetaDeserializer", () => {
  it("should call meta.add for each key-value pair in source", () => {
    const source: MetaDto = {
      foo: "bar",
      count: 42,
      active: true
    };

    const addMock = vi.fn();
    const meta: JsonapiMeta = {
      add: addMock
    } as unknown as JsonapiMeta;

    MetaDeserializer.decodeMeta(meta, source);

    expect(addMock).toHaveBeenCalledTimes(Object.keys(source).length);
    expect(addMock).toHaveBeenCalledWith("foo", "bar");
    expect(addMock).toHaveBeenCalledWith("count", 42);
    expect(addMock).toHaveBeenCalledWith("active", true);
  });

  it("should not call meta.add if source is empty", () => {
    const source: MetaDto = {};
    const addMock = vi.fn();
    const meta: JsonapiMeta = {
      add: addMock
    } as unknown as JsonapiMeta;

    MetaDeserializer.decodeMeta(meta, source);

    expect(addMock).not.toHaveBeenCalled();
  });
});
