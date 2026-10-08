import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorDto, ErrorSerializer, ErrorsSerializer, JsonapiErrors } from "../internals";

describe("ErrorsSerializer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should serialize all errors from JsonapiErrors", () => {
    // Arrange
    const error1 = { id: "1", detail: "Error 1" };
    const error2 = { id: "2", detail: "Error 2" };
    const mockErrors = {
      all: vi.fn().mockReturnValue([error1, error2])
    } as unknown as JsonapiErrors;

    const encoded1: ErrorDto = { code: "E1", detail: "Error 1" };
    const encoded2: ErrorDto = { code: "E2", detail: "Error 2" };

    const serializeErrorSpy = vi.spyOn(ErrorSerializer, "serializeError");
    serializeErrorSpy.mockImplementation((item) => {
      if (item === error1) return encoded1;
      if (item === error2) return encoded2;
      return {} as ErrorDto;
    });

    // Act
    const result = ErrorsSerializer.serializeErrors(mockErrors);

    // Assert
    expect(mockErrors.all).toHaveBeenCalled();
    expect(serializeErrorSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual([encoded1, encoded2]);
  });

  it("should return an empty array if there are no errors", () => {
    const mockErrors = {
      all: vi.fn().mockReturnValue([])
    } as unknown as JsonapiErrors;

    const serializeErrorSpy = vi.spyOn(ErrorSerializer, "serializeError");

    const result = ErrorsSerializer.serializeErrors(mockErrors);

    expect(mockErrors.all).toHaveBeenCalled();
    expect(serializeErrorSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
