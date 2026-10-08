import { describe, it, expect } from "vitest";
import { JsonapiLink, JsonapiResource, ResourceSerializer } from "../internals";

function makePost(): JsonapiResource {
  const post = JsonapiResource.from("posts", "123", { title: "Hello", views: 3 });
  const author = JsonapiResource.from("people", "9", { name: "Ada" });
  author.setRelated("company", JsonapiResource.from("companies", "3", { name: "ACME" }));
  post.setRelated("author", author);

  return post;
}

describe("ResourceSerializer", () => {
  describe("serializeResource", () => {
    it("serializes the type, id and attributes", () => {
      expect(ResourceSerializer.source(makePost()).serializeResource()).toEqual({
        type: "posts",
        id: "123",
        attributes: { title: "Hello", views: 3 }
      });
    });

    it("does not include the id of a temporary resource", () => {
      const resource = JsonapiResource.from("posts", "");
      resource.id = resource.getTempId();

      expect(ResourceSerializer.source(resource).serializeResource()).toEqual({ type: "posts" });
    });

    it("includes meta when not empty", () => {
      const resource = JsonapiResource.from("posts", "1");
      resource.addMeta("locked", true);

      expect(ResourceSerializer.source(resource).serializeResource()).toEqual({
        type: "posts",
        id: "1",
        meta: { locked: true }
      });
    });

    it("keeps only the requested attributes", () => {
      expect(ResourceSerializer.source(makePost()).withOnlyAttributes("title").serializeResource().attributes).toEqual({
        title: "Hello"
      });
    });

    it("omits the attributes when asked", () => {
      expect(ResourceSerializer.source(makePost()).withoutAttributes().serializeResource()).not.toHaveProperty(
        "attributes"
      );
    });

    it("sends a Date attribute as an instant in UTC", () => {
      const date = new Date(2024, 0, 1, 12, 30);
      const resource = JsonapiResource.from("posts", "1", { publishedAt: date });

      expect(ResourceSerializer.source(resource).serializeResource().attributes).toEqual({
        publishedAt: date.toISOString()
      });
    });

    it("sends a Date attribute cast as a date as the local calendar day", () => {
      class Post extends JsonapiResource<{ publishedOn: Date | null }> {
        cast(): Record<"publishedOn", string> {
          return { publishedOn: "date" };
        }
      }
      const resource = new Post();
      resource.fillWith("posts", "1", { publishedOn: new Date(2024, 2, 1, 0, 30) });

      expect(ResourceSerializer.source(resource).serializeResource().attributes).toEqual({
        publishedOn: "2024-03-01"
      });
    });

    it("includes links when not empty", () => {
      const resource = JsonapiResource.from("posts", "1");
      const link = new JsonapiLink();
      link.url = "http://example.com/posts/1";
      resource.links.add("self", link);

      expect(ResourceSerializer.source(resource).serializeResource().links).toEqual({
        self: "http://example.com/posts/1"
      });
    });

    it("does not include relationships when none is requested", () => {
      expect(ResourceSerializer.source(makePost()).serializeResource()).not.toHaveProperty("relationships");
    });

    it("includes the requested relationships", () => {
      expect(
        ResourceSerializer.source(makePost()).withRelationships("author").serializeResource().relationships
      ).toEqual({ author: { data: { type: "people", id: "9" } } });
    });
  });

  describe("withIncluded", () => {
    it("serializes the included resources with their requested relationships", () => {
      const serializer = ResourceSerializer.source(makePost())
        .withRelationships("author")
        .withIncluded({ author: { company: {} } });

      expect(serializer.serializeIncluded()).toEqual([
        {
          type: "people",
          id: "9",
          attributes: { name: "Ada" },
          relationships: { company: { data: { type: "companies", id: "3" } } }
        }
      ]);
    });

    it("returns no included resources by default", () => {
      expect(ResourceSerializer.source(makePost()).serializeIncluded()).toEqual([]);
    });
  });

  describe("toDocument", () => {
    it("returns a document with data and included", () => {
      const document = ResourceSerializer.source(makePost()).withIncluded({ author: {} }).toDocument();

      expect(document.data).toMatchObject({ type: "posts", id: "123" });
      expect(document.included).toEqual([{ type: "people", id: "9", attributes: { name: "Ada" } }]);
    });
  });

  describe("asIncluded", () => {
    it("returns the resource followed by its included resources", () => {
      const included = ResourceSerializer.source(makePost()).withIncluded({ author: {} }).asIncluded();

      expect(included.map((item) => `${item.type}:${item.id}`)).toEqual(["posts:123", "people:9"]);
    });
  });

  describe("toIdentifier", () => {
    it("returns the resource identifier", () => {
      expect(ResourceSerializer.source(makePost()).toIdentifier()).toEqual({ type: "posts", id: "123" });
    });

    it("includes meta in the identifier when not empty", () => {
      const resource = JsonapiResource.from("posts", "1");
      resource.addMeta("locked", true);

      expect(ResourceSerializer.source(resource).toIdentifier()).toEqual({
        type: "posts",
        id: "1",
        meta: { locked: true }
      });
    });
  });
});

describe("ResourceSerializer client-generated ids", () => {
  it("omits a temporary id by default", () => {
    const resource = JsonapiResource.from("test", "", { name: "foo" });
    resource.id = resource.getTempId();

    expect(ResourceSerializer.source(resource).serializeResource().id).toBeUndefined();
  });

  it("sends a temporary id when client-generated ids are allowed", () => {
    const resource = JsonapiResource.from("test", "", { name: "foo" });
    resource.id = resource.getTempId();

    expect(ResourceSerializer.source(resource).withClientGeneratedId().serializeResource().id).toBe(resource.id);
  });

  it("never sends an empty id", () => {
    const resource = JsonapiResource.from("test", "", { name: "foo" });

    expect(ResourceSerializer.source(resource).withClientGeneratedId().serializeResource().id).toBeUndefined();
  });
});
