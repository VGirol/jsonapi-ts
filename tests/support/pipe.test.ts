import { describe, it, expect } from "vitest";
import { pipe } from "../../src/support";

describe("pipe", () => {
  it("returns the value unchanged without any function", async () => {
    expect(await pipe(1).return()).toBe(1);
  });

  it("passes the value through each function in turn", async () => {
    const result = await pipe("a")
      .through(
        (value) => value + "b",
        async (value) => value + "c"
      )
      .through((value) => value + "d")
      .return();

    expect(result).toBe("abcd");
  });

  it("stops at the first function that throws", async () => {
    let called = false;

    const result = pipe(1)
      .through(
        () => {
          throw new Error("stop");
        },
        (value) => {
          called = true;

          return value;
        }
      )
      .return();

    await expect(result).rejects.toThrow("stop");
    expect(called).toBe(false);
  });
});
