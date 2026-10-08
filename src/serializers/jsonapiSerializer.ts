import { JsonapiDto } from "../types";
import { JsonapiJsonapi } from "../models";
import { MetaSerializer } from "./metaSerializer";

export class JsonapiSerializer {
  static serializeJsonapi(source: JsonapiJsonapi): JsonapiDto {
    const obj: JsonapiDto = {};

    if (source.version) {
      obj["version"] = source.version;
    }

    if (!source.meta.empty()) {
      obj["meta"] = MetaSerializer.serializeMeta(source.meta);
    }

    return obj;
  }
}
