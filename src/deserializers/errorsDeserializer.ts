import { JsonapiErrorObject, JsonapiErrors } from "../models";
import { ErrorDto } from "../types";
import { ErrorDeserializer } from "./errorDeserializer";

export class ErrorsDeserializer {
  static decodeErrors(errors: JsonapiErrors, source: ErrorDto[]): void {
    source.forEach((item) => {
      const error = new JsonapiErrorObject();
      ErrorDeserializer.decodeError(error, item);
      errors.add(error);
    });
  }
}
