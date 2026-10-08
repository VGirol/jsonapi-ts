import { JsonapiJsonapi } from "../models";
import { JsonapiDto } from "../types";
import { MetaDeserializer } from "./metaDeserializer";

export class JsonapiDeserializer {
  static decodeJsonapi(jsonapi: JsonapiJsonapi, source: JsonapiDto): void {
    if (source.version) {
      jsonapi.setVersion(source.version);
    }

    if (source.meta) {
      MetaDeserializer.decodeMeta(jsonapi.meta, source.meta);
    }
  }
}
