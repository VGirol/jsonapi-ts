import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonapiLink, LinkDeserializer, LinkDto, MetaDeserializer } from "../internals";

// Mock MetaDeserializer
vi.mock("@/deserializers/metaDeserializer", () => ({
  MetaDeserializer: {
    decodeMeta: vi.fn()
  }
}));

describe("LinkDeserializer", () => {
  let link: JsonapiLink;

  beforeEach(() => {
    link = new JsonapiLink();
    vi.mocked(MetaDeserializer.decodeMeta).mockClear();
  });

  it("should set link.url when source is null", () => {
    LinkDeserializer.decodeLink(link, null);
    expect(link.url).toBeNull();
    expect(link.href).toBeUndefined();
    expect(MetaDeserializer.decodeMeta).not.toHaveBeenCalled();
  });

  it("should set link.url when source is a string", () => {
    LinkDeserializer.decodeLink(link, "http://example.com");
    expect(link.url).toBe("http://example.com");
    expect(link.href).toBeUndefined();
    expect(MetaDeserializer.decodeMeta).not.toHaveBeenCalled();
  });

  it("should set link.href when source has href", () => {
    const source: LinkDto = { href: "http://example.com" };
    LinkDeserializer.decodeLink(link, source);
    expect(link.href).toBe("http://example.com");
    expect(link.url).toBeUndefined();
    expect(MetaDeserializer.decodeMeta).not.toHaveBeenCalled();
  });

  it("should call MetaDeserializer.decodeMeta when source has meta", () => {
    const meta = { foo: "bar" };
    const source: LinkDto = { meta };
    LinkDeserializer.decodeLink(link, source);
    expect(MetaDeserializer.decodeMeta).toHaveBeenCalledWith(link.meta, meta);
  });

  it("should set link.href and call MetaDeserializer.decodeMeta when source has both", () => {
    const meta = { foo: "bar" };
    const source: LinkDto = { href: "http://example.com", meta };
    LinkDeserializer.decodeLink(link, source);
    expect(link.href).toBe("http://example.com");
    expect(MetaDeserializer.decodeMeta).toHaveBeenCalledWith(link.meta, meta);
  });
});
