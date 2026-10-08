import { describe, it, expect, vi } from "vitest";
import { JsonapiMeta, MetaDto, MetaSerializer } from "../internals";

describe("MetaSerializer", () => {
  it("should call toDTO on the source and return its result", () => {
    const dto: MetaDto = { foo: "bar" };
    const mockSource = {
      toDTO: vi.fn().mockReturnValue(dto)
    } as unknown as JsonapiMeta;

    const result = MetaSerializer.serializeMeta(mockSource);

    expect(mockSource.toDTO).toHaveBeenCalledTimes(1);
    expect(result).toBe(dto);
  });
});
