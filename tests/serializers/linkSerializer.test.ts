import { describe, it, expect, vi } from "vitest";
import { JsonapiLink, LinkSerializer, MetaSerializer } from "../internals";

describe("LinkSerializer", () => {
  it("should return source.url if url is defined", () => {
    const source = {
      url: "https://example.com",
      href: "should-not-be-used",
      meta: { empty: () => true }
    } as unknown as JsonapiLink;

    const result = LinkSerializer.serializeLink(source);
    expect(result).toBe("https://example.com");
  });

  it("should return object with href and meta if url is undefined and meta is not empty", () => {
    const metaMock = { empty: vi.fn().mockReturnValue(false) };
    const encodedMeta = { foo: "bar" };
    vi.spyOn(MetaSerializer, "serializeMeta").mockReturnValue(encodedMeta);

    const source = {
      url: undefined,
      href: "https://example.com/href",
      meta: metaMock
    } as unknown as JsonapiLink;

    const result = LinkSerializer.serializeLink(source);
    expect(result).toEqual({
      href: "https://example.com/href",
      meta: encodedMeta
    });
    expect(metaMock.empty).toHaveBeenCalled();
    expect(MetaSerializer.serializeMeta).toHaveBeenCalledWith(metaMock);

    vi.mocked(MetaSerializer.serializeMeta).mockRestore();
  });

  it("should return object with only href if meta is empty", () => {
    const metaMock = { empty: vi.fn().mockReturnValue(true) };

    const source = {
      url: undefined,
      href: "https://example.com/href",
      meta: metaMock
    } as unknown as JsonapiLink;

    const result = LinkSerializer.serializeLink(source);
    expect(result).toEqual({
      href: "https://example.com/href"
    });
    expect(metaMock.empty).toHaveBeenCalled();
  });

  it("should return empty object if url, href are undefined and meta is empty", () => {
    const metaMock = { empty: vi.fn().mockReturnValue(true) };

    const source = {
      url: undefined,
      href: undefined,
      meta: metaMock
    } as unknown as JsonapiLink;

    const result = LinkSerializer.serializeLink(source);
    expect(result).toEqual({});
    expect(metaMock.empty).toHaveBeenCalled();
  });

  it("should return object with only meta if href is undefined and meta is not empty", () => {
    const metaMock = { empty: vi.fn().mockReturnValue(false) };
    const encodedMeta = { bar: "baz" };
    vi.spyOn(MetaSerializer, "serializeMeta").mockReturnValue(encodedMeta);

    const source = {
      url: undefined,
      href: undefined,
      meta: metaMock
    } as unknown as JsonapiLink;

    const result = LinkSerializer.serializeLink(source);
    expect(result).toEqual({
      meta: encodedMeta
    });
    expect(metaMock.empty).toHaveBeenCalled();
    expect(MetaSerializer.serializeMeta).toHaveBeenCalledWith(metaMock);

    vi.mocked(MetaSerializer.serializeMeta).mockRestore();
  });
});
