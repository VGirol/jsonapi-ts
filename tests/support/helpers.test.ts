import { describe, it, expect } from "vitest";
import { isString, toArray } from "../../src/support";

describe("isString", () => {
  it("accepts string primitives and String objects", () => {
    expect(isString("")).toBe(true);
    expect(isString(new String("a"))).toBe(true);
  });

  it("rejects other values", () => {
    expect(isString(1)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString(["a"])).toBe(false);
  });
});

describe("toArray", () => {
  it("wraps a single value", () => {
    expect(toArray("a")).toEqual(["a"]);
    expect(toArray(null)).toEqual([null]);
  });

  it("returns an array unchanged", () => {
    const array = ["a", "b"];

    expect(toArray(array)).toBe(array);
  });
});
