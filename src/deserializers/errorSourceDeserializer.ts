import { JsonapiErrorSource } from "../models";
import { SourceDto } from "../types";

export class ErrorSourceDeserializer {
  static decodeErrorSource(errorSource: JsonapiErrorSource, source: SourceDto): void {
    errorSource.pointer = source.pointer;
    errorSource.parameter = source.parameter;
  }
}
