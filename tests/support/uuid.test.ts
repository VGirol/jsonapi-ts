import { describe, it, expect, vi } from "vitest";
import { randomUuid } from "../../src/support";

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("randomUuid", () => {
  it("returns a v4 UUID", () => {
    expect(randomUuid()).toMatch(V4);
    expect(randomUuid()).not.toBe(randomUuid());
  });

  it("builds a v4 UUID from getRandomValues when randomUUID is missing (insecure context)", () => {
    vi.stubGlobal("crypto", { getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto) });

    try {
      const uuid = randomUuid();
      expect(uuid).toMatch(V4);
      expect(randomUuid()).not.toBe(uuid);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
