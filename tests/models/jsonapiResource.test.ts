import { describe, it, expect } from "vitest";
import { JsonapiResource } from "../internals";

describe("JsonapiResource.castValue", () => {
  const resource = new JsonapiResource();

  it("reads a date as the local midnight of the calendar day", () => {
    const day = resource.castValue("2024-03-01", "date") as Date;

    expect([day.getFullYear(), day.getMonth(), day.getDate(), day.getHours(), day.getMinutes()]).toEqual([
      2024, 2, 1, 0, 0
    ]);
  });

  it("reads a datetime as an instant", () => {
    const instant = resource.castValue("2024-02-29T23:30:00.000000Z", "datetime") as Date;

    expect(instant.toISOString()).toBe("2024-02-29T23:30:00.000Z");
  });

  it("reads a missing date or datetime as null", () => {
    expect(resource.castValue(null, "date")).toBeNull();
    expect(resource.castValue(undefined, "datetime")).toBeNull();
  });

  it("casts the booleans", () => {
    expect(resource.castValue(1, "boolean")).toBe(true);
    expect(resource.castValue(0, "bool")).toBe(false);
  });

  it("keeps a value without cast", () => {
    expect(resource.castValue("2024-03-01", "string")).toBe("2024-03-01");
  });
});

describe("JsonapiResource.isTempResource", () => {
  it("is temporary while the id is empty", () => {
    expect(JsonapiResource.from("test", "").isTempResource()).toBe(true);
  });

  it("is temporary while the id is the one given by getTempId", () => {
    const resource = new JsonapiResource();
    resource.id = resource.getTempId();

    expect(resource.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(resource.isTempResource()).toBe(true);
  });

  it("is no longer temporary once the server id replaces the temporary one", () => {
    const resource = new JsonapiResource();
    resource.id = resource.getTempId();
    resource.id = "12";

    expect(resource.isTempResource()).toBe(false);
  });

  it("is not temporary for an id coming from the server, even when it is a UUID", () => {
    expect(JsonapiResource.from("test", "7f1b9c0e-3d2a-4e5f-8a6b-9c0d1e2f3a4b").isTempResource()).toBe(false);
    expect(JsonapiResource.from("test", "12").isTempResource()).toBe(false);
  });
});
