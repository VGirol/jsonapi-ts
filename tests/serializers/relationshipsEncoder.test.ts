import { describe, it, expect } from "vitest";
import { JsonapiResource, RelationshipsSerializer, ResourceSerializer } from "../internals";

function makePost(): JsonapiResource {
  const post = JsonapiResource.from("posts", "1");
  post.setRelated("author", JsonapiResource.from("people", "9"));
  post.addRelated("comments", [JsonapiResource.from("comments", "5"), JsonapiResource.from("comments", "6")], true);

  return post;
}

describe("AbstractSerializer.withRelationships", () => {
  const relationshipsOf = (names: Parameters<ResourceSerializer<JsonapiResource, object>["withRelationships"]>[0]) =>
    ResourceSerializer.source(JsonapiResource.from("posts", "1")).withRelationships(names).relationships;

  it("keeps an object as it is", () => {
    expect(relationshipsOf({ author: { company: {} } })).toEqual({ author: { company: {} } });
  });

  it("parses a single name", () => {
    expect(relationshipsOf("author")).toEqual({ author: {} });
  });

  it("parses an array of dot notation strings", () => {
    expect(relationshipsOf(["author.company", "author.address", "comments"])).toEqual({
      author: { company: {}, address: {} },
      comments: {}
    });
  });

  it("handles an empty array", () => {
    expect(relationshipsOf([])).toEqual({});
  });

  it("merges successive calls", () => {
    const serializer = ResourceSerializer.source(JsonapiResource.from("posts", "1"))
      .withRelationships("author")
      .withRelationships("comments");

    expect(serializer.relationships).toEqual({ author: {}, comments: {} });
  });
});

describe("RelationshipsSerializer.serializeRelationships", () => {
  it("returns an empty object if no relationship is requested", () => {
    expect(RelationshipsSerializer.serializeRelationships(makePost().relationships, {})).toEqual({});
  });

  it("encodes only the requested relationships", () => {
    expect(RelationshipsSerializer.serializeRelationships(makePost().relationships, { author: {} })).toEqual({
      author: { data: { type: "people", id: "9" } }
    });
  });

  it("encodes to-many relationships", () => {
    expect(RelationshipsSerializer.serializeRelationships(makePost().relationships, { comments: {} })).toEqual({
      comments: {
        data: [
          { type: "comments", id: "5" },
          { type: "comments", id: "6" }
        ]
      }
    });
  });

  it("skips requested relationships the resource does not have", () => {
    expect(RelationshipsSerializer.serializeRelationships(makePost().relationships, { tags: {} })).toEqual({});
  });
});
