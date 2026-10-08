import { JsonapiData, JsonapiResource } from "../models";
import { DtoDataType, ExtractAttributeType, RequestedRelationships, ResourceDto } from "../types";
import { ResourceSerializer } from "./resourceSerializer";

export class DataSerializer {
  static serializeData<M extends JsonapiResource>(
    source: JsonapiData<M>,
    relationships: RequestedRelationships
  ): DtoDataType<ExtractAttributeType<M>> {
    const data = source.get();
    if (data === undefined) {
      throw Error();
    }

    if (data === null) {
      return null;
    }

    if (Array.isArray(data)) {
      return data.map((item) => ResourceSerializer.source(item).withRelationships(relationships).serializeResource());
    }

    return ResourceSerializer.source(data).withRelationships(relationships).serializeResource();
  }

  static serializeIncluded<M extends JsonapiResource>(
    source: JsonapiData<M>,
    requestedRelationships: RequestedRelationships
  ): ResourceDto[] {
    const data = source.get();
    if (data === undefined || data === null) {
      return [];
    }

    if (Array.isArray(data)) {
      return data.flatMap((item) =>
        ResourceSerializer.source(item).withRelationships(requestedRelationships).serializeIncluded()
      );
    }

    return ResourceSerializer.source(data).withRelationships(requestedRelationships).serializeIncluded();
  }
}
