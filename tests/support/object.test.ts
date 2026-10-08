import { describe, it, expect } from "vitest";
import { getByPath } from "../../src/support";
import { JsonapiMeta } from "../../src/models";

describe("getByPath", () => {
  const source = { count: 3, page: { total: 42, size: 0 }, items: [{ name: "first" }], "dotted.key": "flat" };

  it("reads a top-level key", () => {
    expect(getByPath(source, "count")).toBe(3);
  });

  it("walks a dotted path, including array indexes", () => {
    expect(getByPath(source, "page.total")).toBe(42);
    expect(getByPath(source, "page.size")).toBe(0);
    expect(getByPath(source, "items.0.name")).toBe("first");
  });

  it("finds a key that contains dots before walking the path", () => {
    expect(getByPath(source, "dotted.key")).toBe("flat");
  });

  it("returns undefined for a missing segment", () => {
    expect(getByPath(source, "page.missing")).toBeUndefined();
    expect(getByPath(source, "count.value")).toBeUndefined();
    expect(getByPath(source, "missing.total")).toBeUndefined();
    expect(getByPath(null, "page")).toBeUndefined();
  });

  it("does not read inherited properties", () => {
    expect(getByPath(source, "toString")).toBeUndefined();
    expect(getByPath(source, "page.constructor")).toBeUndefined();
  });
});

describe("JsonapiMeta.value", () => {
  it("reads a key and a dotted path", () => {
    const meta = new JsonapiMeta();
    meta.add("message", "Done");
    meta.add("page", { total: 12 });

    expect(meta.value("message")).toBe("Done");
    expect(meta.value("page.total")).toBe(12);
    expect(meta.value("missing")).toBeUndefined();
  });
});
