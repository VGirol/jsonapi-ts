import { describe, it, expect, vi } from "vitest";
import { JsonapiLinks, LinkSerializer, LinksSerializer } from "../internals";

describe("LinksSerializer", () => {
  it("should serialize all links using LinkSerializer", () => {
    // Arrange
    const fakeLinks = {
      self: { href: "/self" },
      related: { href: "/related" }
    };
    const encodedSelf = { url: "/self" };
    const encodedRelated = { url: "/related" };

    // Mock JsonapiLinks
    const mockJsonapiLinks = {
      all: vi.fn().mockReturnValue(fakeLinks)
    } as unknown as JsonapiLinks;

    // Spy on LinkSerializer.serializeLink
    const serializeLinkSpy = vi.spyOn(LinkSerializer, "serializeLink");
    serializeLinkSpy.mockImplementation((link) => {
      if (link === fakeLinks.self) return encodedSelf;
      if (link === fakeLinks.related) return encodedRelated;
      return {};
    });

    // Act
    const result = LinksSerializer.serializeLinks(mockJsonapiLinks);

    // Assert
    expect(mockJsonapiLinks.all).toHaveBeenCalled();
    expect(serializeLinkSpy).toHaveBeenCalledWith(fakeLinks.self);
    expect(serializeLinkSpy).toHaveBeenCalledWith(fakeLinks.related);
    expect(result).toEqual({
      self: encodedSelf,
      related: encodedRelated
    });

    serializeLinkSpy.mockRestore();
  });

  it("should return an empty object if there are no links", () => {
    const mockJsonapiLinks = {
      all: vi.fn().mockReturnValue({})
    } as unknown as JsonapiLinks;

    const serializeLinkSpy = vi.spyOn(LinkSerializer, "serializeLink");

    const result = LinksSerializer.serializeLinks(mockJsonapiLinks);

    expect(result).toEqual({});
    expect(serializeLinkSpy).not.toHaveBeenCalled();

    serializeLinkSpy.mockRestore();
  });
});
