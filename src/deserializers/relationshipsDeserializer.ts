import { RelationshipsDto } from "../types";
import { JsonapiRelationships } from "../models";
import { RelationshipDeserializer } from "./relationshipDeserializer";

export class RelationshipsDeserializer {
  static decodeRelationships(relationships: JsonapiRelationships, source: RelationshipsDto): void {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value.data === "undefined") {
        continue;
      }
      const relationship = relationships.add(key, Array.isArray(value.data));
      RelationshipDeserializer.decodeRelationship(relationship, value);
    }
  }
}
