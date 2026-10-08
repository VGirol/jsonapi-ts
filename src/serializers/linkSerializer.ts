import { LinkDto } from "../types";
import { JsonapiLink } from "../models";
import { MetaSerializer } from "./metaSerializer";

export class LinkSerializer {
  static serializeLink(source: JsonapiLink): LinkDto {
    if (source.url !== undefined) {
      return source.url;
    }

    const obj: LinkDto = {};
    if (source.href) {
      obj["href"] = source.href;
    }
    if (!source.meta.empty()) {
      obj["meta"] = MetaSerializer.serializeMeta(source.meta);
    }

    return obj;
  }
}
