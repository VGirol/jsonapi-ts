import { MetaDto } from "../types";
import { JsonapiMeta } from "../models";

export class MetaDeserializer {
  static decodeMeta(meta: JsonapiMeta, source: MetaDto): void {
    for (const [key, value] of Object.entries(source)) {
      meta.add(key, value);
    }
  }
}
