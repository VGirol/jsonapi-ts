import { LinksDto } from "../types";
import { JsonapiLink, JsonapiLinks } from "../models";
import { LinkDeserializer } from "./linkDeserializer";

export class LinksDeserializer {
  static decodeLinks(links: JsonapiLinks, source: LinksDto): void {
    for (const [key, value] of Object.entries(source)) {
      const link = new JsonapiLink();
      LinkDeserializer.decodeLink(link, value);
      links.add(key, link);
    }
  }
}
