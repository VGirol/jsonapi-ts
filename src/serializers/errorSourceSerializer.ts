import { SourceDto } from "../types";
import { JsonapiErrorSource } from "../models";

export class ErrorSourceSerializer {
  static serializeErrorSource(source: JsonapiErrorSource): SourceDto {
    return {
      pointer: source.pointer,
      parameter: source.parameter
    };
  }
}
