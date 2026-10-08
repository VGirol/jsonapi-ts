import { isString } from "@/support";
import { JsonapiLink } from "../models";
import { LinkDto } from "../types";
import { MetaDeserializer } from "./metaDeserializer";

export class LinkDeserializer {
  static decodeLink(link: JsonapiLink, source: LinkDto): void {
    if (source === null || isString(source)) {
      link.url = source;

      return;
    }

    if (source.href) {
      link.href = source.href;
    }

    if (source.meta) {
      MetaDeserializer.decodeMeta(link.meta, source.meta);
    }
  }
}
