import { describe, it, expect } from "vitest";
import { ErrorSourceDeserializer, JsonapiErrorSource, SourceDto } from "../internals";

describe("ErrorSourceDeserializer", () => {
  it("should copy pointer and parameter from source to errorSource", () => {
    const errorSource: JsonapiErrorSource = { pointer: undefined, parameter: undefined };
    const source: SourceDto = { pointer: "/data/attributes/name", parameter: "filter" };

    ErrorSourceDeserializer.decodeErrorSource(errorSource, source);

    expect(errorSource.pointer).toBe(source.pointer);
    expect(errorSource.parameter).toBe(source.parameter);
  });

  it("should set pointer and parameter to undefined if source has undefined values", () => {
    const errorSource: JsonapiErrorSource = { pointer: "old", parameter: "old" };
    const source: SourceDto = { pointer: undefined, parameter: undefined };

    ErrorSourceDeserializer.decodeErrorSource(errorSource, source);

    expect(errorSource.pointer).toBeUndefined();
    expect(errorSource.parameter).toBeUndefined();
  });

  it("should overwrite only the provided fields", () => {
    const errorSource: JsonapiErrorSource = { pointer: "oldPointer", parameter: "oldParam" };
    const source: SourceDto = { pointer: "/new/pointer", parameter: undefined };

    ErrorSourceDeserializer.decodeErrorSource(errorSource, source);

    expect(errorSource.pointer).toBe("/new/pointer");
    expect(errorSource.parameter).toBeUndefined();
  });
});
