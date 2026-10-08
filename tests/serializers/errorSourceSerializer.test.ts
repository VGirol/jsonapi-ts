import { describe, it, expect } from "vitest";
import { ErrorSourceSerializer, JsonapiErrorSource, SourceDto } from "../internals";

describe("ErrorSourceSerializer", () => {
  it("should serialize error source with pointer and parameter", () => {
    const source: JsonapiErrorSource = {
      pointer: "/data/attributes/name",
      parameter: "name"
    };
    const result = ErrorSourceSerializer.serializeErrorSource(source);
    const expected: SourceDto = {
      pointer: "/data/attributes/name",
      parameter: "name"
    };
    expect(result).toEqual(expected);
  });
});
