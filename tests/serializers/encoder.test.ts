import { describe, it, expect } from "vitest";
import {
  DocumentSerializer,
  JsonapiDocument,
  JsonapiRelationship,
  JsonapiResource,
  RelationshipSerializer,
  ResourceSerializer,
  Serializer
} from "../internals";

describe("Serializer.source", () => {
  it("returns a DocumentSerializer for a document", () => {
    expect(Serializer.source(new JsonapiDocument())).toBeInstanceOf(DocumentSerializer);
  });

  it("returns a RelationshipSerializer for a relationship", () => {
    expect(Serializer.source(new JsonapiRelationship())).toBeInstanceOf(RelationshipSerializer);
  });

  it("returns a ResourceSerializer for a resource", () => {
    expect(Serializer.source(JsonapiResource.from("posts", "1"))).toBeInstanceOf(ResourceSerializer);
  });

  it("throws for any other source", () => {
    expect(() => Serializer.source({} as JsonapiResource)).toThrow(
      "Serializer source must be JsonapiDocument, JsonapiRelationship, or JsonapiResource."
    );
  });

  it("serializes the source to a document, without an empty included member", () => {
    const resource = JsonapiResource.from("posts", "1", { title: "Hello" });

    expect(Serializer.source(resource).toDocument()).toStrictEqual({
      data: { type: "posts", id: "1", attributes: { title: "Hello" } }
    });
  });
});
