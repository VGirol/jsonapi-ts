import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorDeserializer, ErrorDto, ErrorsDeserializer, JsonapiErrors } from "../internals";

vi.mock("@/deserializers/errorDeserializer", () => ({
  ErrorDeserializer: {
    decodeError: vi.fn()
  }
}));

class MockJsonapiErrors {
  add = vi.fn();
}

describe("ErrorsDeserializer", () => {
  let errors: MockJsonapiErrors;
  let source: ErrorDto[];

  beforeEach(() => {
    errors = new MockJsonapiErrors();
    source = [{ code: "E1", title: "Error 1" } as ErrorDto, { code: "E2", title: "Error 2" } as ErrorDto];
    (ErrorDeserializer.decodeError as ReturnType<typeof vi.fn>).mockClear();
  });

  it("should decode and add each error from source", () => {
    ErrorsDeserializer.decodeErrors(errors as unknown as JsonapiErrors, source);

    expect(vi.mocked(ErrorDeserializer.decodeError).mock.calls.length).toBe(2);
    expect(errors.add).toHaveBeenCalledTimes(2);

    // Each decodeError should be called with a JsonapiErrorObject and the corresponding ErrorDto
    source.forEach((item, idx) => {
      expect(vi.mocked(ErrorDeserializer.decodeError).mock.calls[idx][1]).toBe(item);
    });
  });

  it("should not call add or decodeError if source is empty", () => {
    ErrorsDeserializer.decodeErrors(errors as unknown as JsonapiErrors, []);
    expect(vi.mocked(ErrorDeserializer.decodeError).mock.calls.length).toBe(0);
    expect(errors.add).not.toHaveBeenCalled();
  });
});
