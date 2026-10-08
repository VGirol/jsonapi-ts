import { describe, it, expect } from "vitest";
import { DataSerializer, JsonapiData, JsonapiResource } from "../internals";

function makeData(value?: JsonapiResource | JsonapiResource[] | null): JsonapiData {
  const data = new JsonapiData();
  if (value !== undefined) {
    data.set(value);
  }

  return data;
}

function makeAuthoredPost(): JsonapiResource {
  const post = JsonapiResource.from("posts", "1", { title: "Hello" });
  post.setRelated("author", JsonapiResource.from("people", "9", { name: "Ada" }));

  return post;
}

describe("DataSerializer", () => {
  describe("serializeData", () => {
    it("throws if data is undefined", () => {
      expect(() => DataSerializer.serializeData(makeData(), {})).toThrow();
    });

    it("returns null if data is null", () => {
      expect(DataSerializer.serializeData(makeData(null), {})).toBeNull();
    });

    it("encodes array of resources", () => {
      const data = makeData([JsonapiResource.from("posts", "1"), JsonapiResource.from("posts", "2")]);

      expect(DataSerializer.serializeData(data, {})).toEqual([
        { type: "posts", id: "1" },
        { type: "posts", id: "2" }
      ]);
    });

    it("encodes single resource", () => {
      const data = makeData(JsonapiResource.from("posts", "1", { title: "Hello" }));

      expect(DataSerializer.serializeData(data, {})).toEqual({
        type: "posts",
        id: "1",
        attributes: { title: "Hello" }
      });
    });

    it("serializes only the requested relationships", () => {
      const data = makeData(makeAuthoredPost());

      expect(DataSerializer.serializeData(data, {})).not.toHaveProperty("relationships");
      expect(DataSerializer.serializeData(data, { author: {} })).toEqual({
        type: "posts",
        id: "1",
        attributes: { title: "Hello" },
        relationships: { author: { data: { type: "people", id: "9" } } }
      });
    });
  });

  describe("serializeIncluded", () => {
    it("returns [] if data is undefined", () => {
      expect(DataSerializer.serializeIncluded(makeData(), {})).toEqual([]);
    });

    it("returns [] if data is null", () => {
      expect(DataSerializer.serializeIncluded(makeData(null), {})).toEqual([]);
    });

    it("returns [] for resources without included relationships", () => {
      const data = makeData([JsonapiResource.from("posts", "1"), JsonapiResource.from("posts", "2")]);

      expect(DataSerializer.serializeIncluded(data, {})).toEqual([]);
    });
  });
});
