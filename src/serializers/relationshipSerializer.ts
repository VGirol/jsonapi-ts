import { MetaSerializer } from "./metaSerializer";
import { ResourceSerializer } from "./resourceSerializer";
import { JsonapiRelationship, JsonapiResource } from "../models";
import {
  DocumentDto,
  ExtractAttributeType,
  MetaDto,
  RawRequestedIncluded,
  RelationshipDto,
  ResourceDto,
  ResourceIdentifierDto
} from "../types";
import { AbstractSerializer } from "./abstractSerializer";

export class RelationshipSerializer<R extends JsonapiResource, M extends MetaDto = MetaDto> extends AbstractSerializer<
  R,
  M,
  JsonapiRelationship<R>
> {
  static source<S extends JsonapiResource>(source: JsonapiRelationship<S>) {
    return new this(source);
  }

  toDocument<M extends JsonapiResource>(): DocumentDto<ExtractAttributeType<M>> {
    return {
      data: this.serializeData()
    };
  }

  asIncluded(): ResourceDto[] {
    const data = this.source.data;
    if (data === undefined) {
      throw new Error("No relationship data.");
    }

    return data === null
      ? []
      : Array.isArray(data)
        ? data.map((item) => ResourceSerializer.source(item).withRelationships(this.relationships).serializeResource())
        : [ResourceSerializer.source(data).withRelationships(this.relationships).serializeResource()];
  }

  withIncluded(_included: RawRequestedIncluded): this {
    throw new Error("Not allowed !");
  }

  serializeRelationship(): RelationshipDto {
    const obj: RelationshipDto = {
      data: this.serializeData()
    };

    if (!this.source.meta.empty()) {
      obj["meta"] = MetaSerializer.serializeMeta(this.source.meta);
    }

    return obj;
  }

  serializeData(): ResourceIdentifierDto | ResourceIdentifierDto[] | null {
    const data = this.source.data;
    if (data === undefined) {
      throw new Error("No relationship data.");
    }

    return data === null
      ? null
      : Array.isArray(data)
        ? data.map((item) => ResourceSerializer.source(item).toIdentifier())
        : ResourceSerializer.source(data).toIdentifier();
  }
}
