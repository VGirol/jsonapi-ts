import { describe, it, expect } from "vitest";
import { JsonapiRelationship, JsonapiResource, RelationshipSerializer } from "../internals";

function toOne(related: JsonapiResource | null): JsonapiRelationship {
  const relationship = new JsonapiRelationship(false);
  relationship.addRelated(related);

  return relationship;
}

function toMany(related: JsonapiResource[]): JsonapiRelationship {
  const relationship = new JsonapiRelationship(true);
  relationship.addRelated(related);

  return relationship;
}

// A to-one relationship whose related resource is missing from the included resources.
function undefinedRelationship(): JsonapiRelationship {
  const relationship = new JsonapiRelationship(false);
  relationship.setSource({ data: { type: "people", id: "9" } });
  relationship.createRelatedTree([]);

  return relationship;
}

describe("RelationshipSerializer", () => {
  describe("serializeData", () => {
    it("throws if data is undefined", () => {
      expect(() => RelationshipSerializer.source(undefinedRelationship()).serializeData()).toThrow(
        "No relationship data."
      );
    });

    it("returns null if data is null", () => {
      expect(RelationshipSerializer.source(toOne(null)).serializeData()).toBeNull();
    });

    it("serializes a single resource identifier", () => {
      const relationship = toOne(JsonapiResource.from("people", "9", { name: "Ada" }));

      expect(RelationshipSerializer.source(relationship).serializeData()).toEqual({ type: "people", id: "9" });
    });

    it("serializes an array of resource identifiers", () => {
      const relationship = toMany([JsonapiResource.from("comments", "5"), JsonapiResource.from("comments", "6")]);

      expect(RelationshipSerializer.source(relationship).serializeData()).toEqual([
        { type: "comments", id: "5" },
        { type: "comments", id: "6" }
      ]);
    });

    it("serializes the identifier meta", () => {
      const person = JsonapiResource.from("people", "9");
      person.addMeta("role", "author");

      expect(RelationshipSerializer.source(toOne(person)).serializeData()).toEqual({
        type: "people",
        id: "9",
        meta: { role: "author" }
      });
    });
  });

  describe("serializeRelationship", () => {
    it("serializes the data only when meta is empty", () => {
      const relationship = toOne(JsonapiResource.from("people", "9"));

      expect(RelationshipSerializer.source(relationship).serializeRelationship()).toEqual({
        data: { type: "people", id: "9" }
      });
    });

    it("serializes the relationship meta", () => {
      const relationship = toOne(JsonapiResource.from("people", "9"));
      relationship.meta.add("count", 1);

      expect(RelationshipSerializer.source(relationship).serializeRelationship()).toEqual({
        data: { type: "people", id: "9" },
        meta: { count: 1 }
      });
    });
  });

  describe("asIncluded", () => {
    it("throws if data is undefined", () => {
      expect(() => RelationshipSerializer.source(undefinedRelationship()).asIncluded()).toThrow(
        "No relationship data."
      );
    });

    it("returns an empty array if data is null", () => {
      expect(RelationshipSerializer.source(toOne(null)).asIncluded()).toEqual([]);
    });

    it("serializes a single resource", () => {
      const relationship = toOne(JsonapiResource.from("people", "9", { name: "Ada" }));

      expect(RelationshipSerializer.source(relationship).asIncluded()).toEqual([
        { type: "people", id: "9", attributes: { name: "Ada" } }
      ]);
    });

    it("serializes an array of resources", () => {
      const relationship = toMany([JsonapiResource.from("comments", "5"), JsonapiResource.from("comments", "6")]);

      expect(RelationshipSerializer.source(relationship).asIncluded()).toEqual([
        { type: "comments", id: "5" },
        { type: "comments", id: "6" }
      ]);
    });

    it("serializes the requested nested relationships", () => {
      const person = JsonapiResource.from("people", "9");
      person.setRelated("company", JsonapiResource.from("companies", "3"));

      expect(RelationshipSerializer.source(toOne(person)).withRelationships("company").asIncluded()).toEqual([
        { type: "people", id: "9", relationships: { company: { data: { type: "companies", id: "3" } } } }
      ]);
    });
  });

  describe("toDocument", () => {
    it("returns data: null for an empty to-one relationship", () => {
      expect(RelationshipSerializer.source(toOne(null)).toDocument()).toEqual({ data: null });
    });

    it("serializes a single related resource identifier", () => {
      const relationship = toOne(JsonapiResource.from("people", "9", { name: "Ada" }));

      expect(RelationshipSerializer.source(relationship).toDocument()).toEqual({ data: { type: "people", id: "9" } });
    });

    it("serializes an array of related resource identifiers", () => {
      const relationship = toMany([JsonapiResource.from("comments", "5")]);

      expect(RelationshipSerializer.source(relationship).toDocument()).toEqual({
        data: [{ type: "comments", id: "5" }]
      });
    });
  });

  it("does not allow included resources", () => {
    expect(() => RelationshipSerializer.source(toOne(null)).withIncluded({})).toThrow("Not allowed !");
  });
});
