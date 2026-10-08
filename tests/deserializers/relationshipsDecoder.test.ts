import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  JsonapiRelationships,
  RelationshipDeserializer,
  RelationshipsDeserializer,
  RelationshipsDto
} from "../internals";

describe("RelationshipsDeserializer", () => {
  let mockRelationships: JsonapiRelationships;
  let addMock: ReturnType<typeof vi.fn>;
  let decodeRelationshipSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addMock = vi.fn();
    mockRelationships = {
      add: addMock
    } as unknown as JsonapiRelationships;

    decodeRelationshipSpy = vi.spyOn(RelationshipDeserializer, "decodeRelationship").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should decode each relationship in the source object", () => {
    const source: RelationshipsDto = {
      author: { data: { id: "1", type: "users" } },
      comments: { data: [{ id: "2", type: "comments" }] }
    };

    const rel1 = {};
    const rel2 = {};
    addMock.mockReturnValueOnce(rel1).mockReturnValueOnce(rel2);

    RelationshipsDeserializer.decodeRelationships(mockRelationships, source);

    expect(addMock).toHaveBeenCalledTimes(2);
    expect(addMock).toHaveBeenNthCalledWith(1, "author", false);
    expect(addMock).toHaveBeenNthCalledWith(2, "comments", true);

    expect(decodeRelationshipSpy).toHaveBeenCalledTimes(2);
    expect(decodeRelationshipSpy).toHaveBeenCalledWith(rel1, source.author);
    expect(decodeRelationshipSpy).toHaveBeenCalledWith(rel2, source.comments);
  });

  it("should handle empty source", () => {
    const source: RelationshipsDto = {};
    RelationshipsDeserializer.decodeRelationships(mockRelationships, source);
    expect(addMock).not.toHaveBeenCalled();
    expect(decodeRelationshipSpy).not.toHaveBeenCalled();
  });
});
