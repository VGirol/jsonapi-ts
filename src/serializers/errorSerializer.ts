import { ErrorDto } from "../types";
import { JsonapiErrorObject } from "../models";
import { MetaSerializer } from "./metaSerializer";
import { LinksSerializer } from "./linksSerializer";
import { ErrorSourceSerializer } from "./errorSourceSerializer";

export class ErrorSerializer {
  static serializeError(source: JsonapiErrorObject): ErrorDto {
    const obj: ErrorDto = {};

    if (source.id) {
      obj["id"] = source.id;
    }
    if (source.status) {
      obj["status"] = source.status;
    }
    if (source.code) {
      obj["code"] = source.code;
    }
    if (source.title) {
      obj["title"] = source.title;
    }
    if (source.detail) {
      obj["detail"] = source.detail;
    }

    obj["source"] = ErrorSourceSerializer.serializeErrorSource(source.source);

    if (!source.links.empty()) {
      obj["links"] = LinksSerializer.serializeLinks(source.links);
    }
    if (!source.meta.empty()) {
      obj["meta"] = MetaSerializer.serializeMeta(source.meta);
    }

    return obj;
  }
}
