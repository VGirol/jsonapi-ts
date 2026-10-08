import { RelationshipDto } from "../types";
import { JsonapiRelationship } from "../models";
import { MetaDeserializer } from "./metaDeserializer";

export class RelationshipDeserializer {
  static decodeRelationship(relationship: JsonapiRelationship, source: RelationshipDto): void {
    relationship.setSource(source);

    if (source.meta) {
      MetaDeserializer.decodeMeta(relationship.meta, source.meta);
    }
  }
}
