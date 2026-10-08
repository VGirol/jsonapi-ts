import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AttributesObject,
  JsonapiResource,
  LinksDeserializer,
  MetaDeserializer,
  RelationshipsDeserializer,
  ResourceDeserializer,
  ResourceDto,
  Dictionary
} from "../internals";

// Mock classes and dependencies
class DummyResource extends JsonapiResource {
  type = "";
  id = "";
  attributes: AttributesObject = {};

  setAttributes(attrs: AttributesObject) {
    this.attributes = attrs;
  }
  castAttributes(attrs: AttributesObject) {
    return { ...attrs, casted: true };
  }
}

vi.mock("@/deserializers/relationshipsDeserializer", () => ({
  RelationshipsDeserializer: {
    decodeRelationships: vi.fn()
  }
}));

vi.mock("@/deserializers/metaDeserializer", () => ({
  MetaDeserializer: {
    decodeMeta: vi.fn()
  }
}));

vi.mock("@/deserializers/linksDeserializer", () => ({
  LinksDeserializer: {
    decodeLinks: vi.fn()
  }
}));

describe("ResourceDeserializer", () => {
  const baseDto: ResourceDto = {
    type: "dummy",
    id: "123",
    attributes: { foo: "bar" },
    meta: { page: 1 },
    links: { self: "/dummy/123" },
    relationships: { rel: { data: { type: "other", id: "456" } } }
  };

  let resource: DummyResource;
  let dictionary: Dictionary;

  beforeEach(() => {
    resource = new DummyResource();
    dictionary = new Dictionary();
    vi.spyOn(dictionary, "make").mockReturnValue(resource);
    (RelationshipsDeserializer.decodeRelationships as ReturnType<typeof vi.fn>).mockClear();
    (MetaDeserializer.decodeMeta as ReturnType<typeof vi.fn>).mockClear();
    (LinksDeserializer.decodeLinks as ReturnType<typeof vi.fn>).mockClear();
  });

  it("should decode a resource and set type and id", () => {
    const result = ResourceDeserializer.decodeResource(baseDto, dictionary);
    expect(result).toBe(resource);
    expect(result.type).toBe("dummy");
    expect(result.id).toBe("123");
    expect(dictionary.make).toHaveBeenCalledWith("dummy");
  });

  it("should set attributes using setAttributes and castAttributes", () => {
    ResourceDeserializer.decodeResource(baseDto, dictionary);
    expect(resource.attributes).toEqual({ foo: "bar", casted: true });
  });

  it("should decode meta if present", () => {
    ResourceDeserializer.decodeResource(baseDto, dictionary);
    expect(MetaDeserializer.decodeMeta).toHaveBeenCalledWith(resource.meta, baseDto.meta);
  });

  it("should decode links if present", () => {
    ResourceDeserializer.decodeResource(baseDto, dictionary);
    expect(LinksDeserializer.decodeLinks).toHaveBeenCalledWith(resource.links, baseDto.links);
  });

  it("should decode relationships if present", () => {
    ResourceDeserializer.decodeResource(baseDto, dictionary);
    expect(RelationshipsDeserializer.decodeRelationships).toHaveBeenCalledWith(
      resource.relationships,
      baseDto.relationships
    );
  });

  it("should handle missing optional fields gracefully", () => {
    const minimalDto: ResourceDto = { type: "dummy" };
    ResourceDeserializer.decodeResource(minimalDto, dictionary);
    expect(resource.type).toBe("dummy");
    expect(resource.id).toBe("");
    expect(resource.attributes).toEqual({});
    expect(MetaDeserializer.decodeMeta).not.toHaveBeenCalled();
    expect(LinksDeserializer.decodeLinks).not.toHaveBeenCalled();
    expect(RelationshipsDeserializer.decodeRelationships).not.toHaveBeenCalled();
  });
});
