import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonapiLink, JsonapiLinks, LinkDeserializer, LinksDeserializer, LinksDto } from "../internals";

vi.mock("@/deserializers/linkDeserializer", () => ({
  LinkDeserializer: {
    decodeLink: vi.fn()
  }
}));

describe("LinksDeserializer", () => {
  let links: JsonapiLinks;
  let source: LinksDto;

  beforeEach(() => {
    // Minimal mock for JsonapiLinks
    links = {
      add: vi.fn()
    } as unknown as JsonapiLinks;

    source = {
      self: { href: "http://example.com/self" },
      related: { href: "http://example.com/related" }
    };
    (LinkDeserializer.decodeLink as ReturnType<typeof vi.fn>).mockClear();
    (links.add as ReturnType<typeof vi.fn>).mockClear();
  });

  it("should decode all links from source and add them to links", () => {
    LinksDeserializer.decodeLinks(links, source);

    // Should call decodeLink for each entry
    expect(LinkDeserializer.decodeLink).toHaveBeenCalledTimes(2);

    // Should call add for each entry
    expect(links.add).toHaveBeenCalledTimes(2);

    // Should call add with correct keys and instances of JsonapiLink
    expect(vi.mocked(links.add).mock.calls[0][0]).toBe("self");
    expect(vi.mocked(links.add).mock.calls[1][0]).toBe("related");
    expect(vi.mocked(links.add).mock.calls[0][1]).toBeInstanceOf(JsonapiLink);
    expect(vi.mocked(links.add).mock.calls[1][1]).toBeInstanceOf(JsonapiLink);

    // Should call decodeLink with a JsonapiLink and correct value
    expect(vi.mocked(LinkDeserializer.decodeLink).mock.calls[0][1]).toBe(source.self);
    expect(vi.mocked(LinkDeserializer.decodeLink).mock.calls[1][1]).toBe(source.related);
    expect(vi.mocked(LinkDeserializer.decodeLink).mock.calls[0][0]).toBeInstanceOf(JsonapiLink);
    expect(vi.mocked(LinkDeserializer.decodeLink).mock.calls[1][0]).toBeInstanceOf(JsonapiLink);
  });

  it("should do nothing if source is empty", () => {
    LinksDeserializer.decodeLinks(links, {});
    expect(LinkDeserializer.decodeLink).not.toHaveBeenCalled();
    expect(links.add).not.toHaveBeenCalled();
  });
});
