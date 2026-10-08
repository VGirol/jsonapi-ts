import { describe, it, expect } from "vitest";
import { toCalendarDay, toDate } from "../../src/support";

describe("toDate", () => {
  it("reads a calendar day as the local midnight of that day", () => {
    const date = toDate("2026-03-01");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it("reads any other string as an instant", () => {
    expect(toDate("2026-03-01T10:20:30Z").toISOString()).toBe("2026-03-01T10:20:30.000Z");
  });

  it("returns a date unchanged", () => {
    const date = new Date(2026, 2, 1);

    expect(toDate(date)).toBe(date);
  });
});

describe("toCalendarDay", () => {
  it("writes the local day of a date", () => {
    expect(toCalendarDay(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("gives back the day read by toDate", () => {
    expect(toCalendarDay(toDate("2026-12-31"))).toBe("2026-12-31");
  });
});
