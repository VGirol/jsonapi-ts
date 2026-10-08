import { describe, it, expect, beforeAll } from "vitest";
import {
  JsonapiDocument,
  jsonapiDictionary,
  JsonapiRelationship,
  JsonapiResource,
  ResourceFactory
} from "../internals";

class DummyResource extends JsonapiResource<{ foo: string }> {}

describe("ResourceFactory", () => {
  beforeAll(() => {
    jsonapiDictionary.add("dummy", DummyResource);
  });

  describe("getModelInstance", () => {
    it("returns a new instance of the registered resource", () => {
      expect(ResourceFactory.getModelInstance("dummy")).toBeInstanceOf(DummyResource);
    });
  });

  describe("from", () => {
    it("creates and fills a resource instance", () => {
      const instance = ResourceFactory.from<DummyResource>("dummy", "1", { foo: "bar" });

      expect(instance).toBeInstanceOf(DummyResource);
      expect(instance.type).toBe("dummy");
      expect(instance.id).toBe("1");
      expect(instance.attribute("foo")).toBe("bar");
    });

    it("leaves the id empty when it is null", () => {
      expect(ResourceFactory.from("dummy", null).id).toBe("");
    });
  });

  describe("toDocument", () => {
    it("throws if the source cannot be serialized", () => {
      expect(() => ResourceFactory.toDocument({} as JsonapiResource)).toThrow(
        "Source must be JsonapiResource or JsonapiRelationship instance."
      );
    });

    it("turns a resource into a document", () => {
      const document = ResourceFactory.toDocument(ResourceFactory.from<DummyResource>("dummy", "1", { foo: "bar" }));

      expect(document).toBeInstanceOf(JsonapiDocument);
      expect(document.dataAsResource).toBeInstanceOf(DummyResource);
      expect(document.dataAsResource.attribute("foo")).toBe("bar");
    });

    it("turns a relationship into a document of identifiers", () => {
      const relationship = new JsonapiRelationship<DummyResource>(true);
      relationship.addRelated([ResourceFactory.from<DummyResource>("dummy", "1", { foo: "bar" })]);

      const document = ResourceFactory.toDocument(relationship);
      const data = document.data as DummyResource[];

      expect(data).toHaveLength(1);
      expect(data[0].id).toBe("1");
      expect(data[0].hasAttributes()).toBe(false);
    });
  });
});
