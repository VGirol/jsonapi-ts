import { LinksDto } from "../types";
import { JsonapiLinks } from "../models";
import { LinkSerializer } from "./linkSerializer";

export class LinksSerializer {
  static serializeLinks(source: JsonapiLinks): LinksDto {
    const obj: LinksDto = {};

    for (const [key, link] of Object.entries(source.all())) {
      obj[key] = LinkSerializer.serializeLink(link);
    }

    return obj;
  }
}
