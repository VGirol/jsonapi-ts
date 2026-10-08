import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  JsonapiMeta,
  JsonapiRelationship,
  MetaDeserializer,
  RelationshipDeserializer,
  RelationshipDto
} from "../internals";

describe("RelationshipDeserializer", () => {
  let mockRelationship: JsonapiRelationship;
  let setSourceSpy: ReturnType<typeof vi.fn>;
  let mockMeta: JsonapiMeta;

  beforeEach(() => {
    setSourceSpy = vi.fn();
    mockMeta = new JsonapiMeta();
    mockRelationship = {
      setSource: setSourceSpy,
      meta: mockMeta
    } as unknown as JsonapiRelationship;
    vi.restoreAllMocks();
  });

  it("should call setSource with the source", () => {
    const source: RelationshipDto = { id: "1", type: "test" };
    RelationshipDeserializer.decodeRelationship(mockRelationship, source);
    expect(setSourceSpy).toHaveBeenCalledWith(source);
  });

  it("should call MetaDeserializer.decodeMeta if source.meta exists", () => {
    const decodeMetaSpy = vi.spyOn(MetaDeserializer, "decodeMeta").mockImplementation(() => {});
    const source: RelationshipDto = { id: "1", type: "test", meta: { foo: "bar" } };
    RelationshipDeserializer.decodeRelationship(mockRelationship, source);
    expect(decodeMetaSpy).toHaveBeenCalledWith(mockMeta, source.meta);
  });

  it("should not call MetaDeserializer.decodeMeta if source.meta does not exist", () => {
    const decodeMetaSpy = vi.spyOn(MetaDeserializer, "decodeMeta").mockImplementation(() => {});
    const source: RelationshipDto = { id: "1", type: "test" };
    RelationshipDeserializer.decodeRelationship(mockRelationship, source);
    expect(decodeMetaSpy).not.toHaveBeenCalled();
  });
});
