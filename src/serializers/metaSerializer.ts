import { MetaDto } from "../types";
import { JsonapiMeta } from "../models";

export class MetaSerializer {
  static serializeMeta<M extends MetaDto = MetaDto>(source: JsonapiMeta<M>): MetaDto {
    return source.toDTO();
  }
}
