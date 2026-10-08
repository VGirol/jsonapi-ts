import { JsonapiRelationships } from "../models";
import { RelationshipsDto, RequestedRelationships } from "../types";
import { RelationshipSerializer } from "./relationshipSerializer";

export class RelationshipsSerializer {
  static serializeRelationships(source: JsonapiRelationships, relationships: RequestedRelationships): RelationshipsDto {
    const obj: RelationshipsDto = {};
    for (const [key, value] of Object.entries(source.all)) {
      if (typeof relationships === "undefined" || typeof relationships[key] === "undefined") {
        continue;
      }

      obj[key] = RelationshipSerializer.source(value).withRelationships(relationships[key]).serializeRelationship();
    }

    return obj;
  }
}
