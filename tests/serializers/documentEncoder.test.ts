import { describe, it, expect, beforeEach } from "vitest";
import { DocumentSerializer, JsonapiDocument, JsonapiErrorObject, JsonapiLink, JsonapiResource } from "../internals";

describe("DocumentSerializer.toDocument", () => {
  let doc: JsonapiDocument;

  beforeEach(() => {
    doc = new JsonapiDocument();
  });

  const serialize = () => new DocumentSerializer(doc).toDocument();

  it("returns an empty dto if all fields are empty", () => {
    expect(serialize()).toEqual({});
  });

  it("encodes meta if not empty", () => {
    doc.meta.add("total", 3);

    expect(serialize()).toEqual({ meta: { total: 3 } });
  });

  it("encodes jsonapi if not empty", () => {
    doc.setJsonApiVersion("1.1");

    expect(serialize()).toEqual({ jsonapi: { version: "1.1" } });
  });

  it("encodes links if not empty", () => {
    const link = new JsonapiLink();
    link.url = "http://example.com/posts";
    doc.links.add("self", link);

    expect(serialize()).toEqual({ links: { self: "http://example.com/posts" } });
  });

  it("encodes data without included when no relationship is requested", () => {
    doc.dataObject.set(JsonapiResource.from("posts", "1", { title: "Hello" }));

    expect(serialize()).toEqual({ data: { type: "posts", id: "1", attributes: { title: "Hello" } } });
  });

  it("encodes errors if present", () => {
    const error = new JsonapiErrorObject();
    error.status = "422";
    error.detail = "Invalid title.";
    doc.errors.add(error);

    const dto = serialize();

    expect(dto.errors).toHaveLength(1);
    expect(dto.errors?.[0]).toMatchObject({ status: "422", detail: "Invalid title." });
  });

  it("does not encode an empty errors member next to data", () => {
    doc.dataObject.set(JsonapiResource.from("posts", "1"));

    expect(serialize()).not.toHaveProperty("errors");
  });

  it("throws when included resources are requested", () => {
    expect(() => new DocumentSerializer(doc).withIncluded({})).toThrow("Not allowed !");
  });

  it("throws when serialized as included resources", () => {
    expect(() => new DocumentSerializer(doc).asIncluded()).toThrow("Not allowed !");
  });
});
