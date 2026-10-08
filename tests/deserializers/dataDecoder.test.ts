import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataDeserializer, JsonapiData, JsonapiResource, jsonapiDictionary, ResourceDeserializer } from "../internals";

// Mocks
class TestResource extends JsonapiResource {
  id!: string;
  type = "test";
  attributes!: { foo: string };
}

describe("DataDeserializer", () => {
  let data: JsonapiData<TestResource>;

  beforeEach(() => {
    data = {
      set: vi.fn()
    } as unknown as JsonapiData<TestResource>;
    vi.restoreAllMocks();
  });

  it("should set data to null if source is null", () => {
    DataDeserializer.decodeData(data, null);
    expect(data.set).toHaveBeenCalledWith(null);
  });

  it("should decode and set a single resource", () => {
    const source = { id: "1", type: "test", attributes: { foo: "bar" } };
    const decoded = { ...source, decoded: true };
    vi.spyOn(ResourceDeserializer, "decodeResource").mockReturnValue(decoded as unknown as TestResource);

    DataDeserializer.decodeData(data, source);

    expect(ResourceDeserializer.decodeResource).toHaveBeenCalledWith(source, jsonapiDictionary);
    expect(data.set).toHaveBeenCalledWith(decoded);
  });

  it("should decode and set an array of resources", () => {
    const source = [
      { id: "1", type: "test", attributes: { foo: "bar" } },
      { id: "2", type: "test", attributes: { foo: "baz" } }
    ];
    // new JsonapiResource().fillWith(source[1].type, source[1].id, source[1].attributes);
    const decoded = [
      { ...source[0], decoded: true },
      { ...source[1], decoded: true }
    ];
    vi.spyOn(ResourceDeserializer, "decodeResource").mockImplementation((item) =>
      item.id === "1" ? decoded[0] : decoded[1]
    );

    DataDeserializer.decodeData(data, source);

    expect(ResourceDeserializer.decodeResource).toHaveBeenCalledTimes(2);
    expect(ResourceDeserializer.decodeResource).toHaveBeenCalledWith(source[0], jsonapiDictionary);
    expect(ResourceDeserializer.decodeResource).toHaveBeenCalledWith(source[1], jsonapiDictionary);
    expect(data.set).toHaveBeenCalledWith(decoded);
  });
});
