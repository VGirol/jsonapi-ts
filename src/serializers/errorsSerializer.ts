import { ErrorDto } from "../types";
import { JsonapiErrors } from "../models";
import { ErrorSerializer } from "./errorSerializer";

export class ErrorsSerializer {
  static serializeErrors(source: JsonapiErrors): ErrorDto[] {
    return source.all().map((item) => ErrorSerializer.serializeError(item));
  }
}
