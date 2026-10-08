import { toCalendarDay } from "@/support";
import { MetaSerializer } from "./metaSerializer";
import { LinksSerializer } from "./linksSerializer";
import { RelationshipsSerializer } from "./relationshipsSerializer";
import {
  DocumentDto,
  ExtractAttributeType,
  MetaDto,
  RawRequestedIncluded,
  ResourceDto,
  ResourceIdentifierDto,
  SourceType
} from "../types";
import { JsonapiResource } from "../models";
import { AbstractSerializer } from "./abstractSerializer";
import { Serializer } from "./serializer";

export class ResourceSerializer<R extends JsonapiResource, M extends MetaDto> extends AbstractSerializer<R, M, R> {
  included: AbstractSerializer<JsonapiResource, MetaDto, SourceType<JsonapiResource, MetaDto>>[] = [];

  static source<S extends JsonapiResource>(source: S) {
    return new this(source);
  }

  /**
   * Can use dot notation.
   */
  withIncluded(included: RawRequestedIncluded): this {
    Object.entries(included).forEach(([path, relationships]) => {
      const source = this.source.relationship(path);
      this.included.push(Serializer.source(source).withRelationships(relationships));
    });

    return this;
  }

  toDocument(): DocumentDto<ExtractAttributeType<R>> {
    const dto: DocumentDto<ExtractAttributeType<R>> = { data: this.serializeResource() };

    const included = this.serializeIncluded();
    if (included.length > 0) {
      dto.included = included;
    }

    return dto;
  }

  asIncluded(): ResourceDto[] {
    return [this.serializeResource(), ...this.serializeIncluded()];
  }

  serializeResource(): ResourceDto<ExtractAttributeType<R>> {
    const obj: ResourceDto<ExtractAttributeType<R>> = {
      type: this.source.type
    };

    // A temporary id is only sent when client-generated ids are allowed
    if (this.source.id !== "" && (!this.source.isTempResource() || this.clientGeneratedIdAllowed)) {
      obj["id"] = this.source.id;
    }

    if (!this.source.meta.empty()) {
      obj["meta"] = MetaSerializer.serializeMeta(this.source.meta);
    }

    if (this.source.hasAttributes() && !this.noAttributes) {
      const casts = this.source.cast() as Record<string, string | undefined>;
      obj["attributes"] = Object.fromEntries(
        Object.entries(this.source.attributes)
          .filter(([key]) => this.attributes.length == 0 || this.attributes.includes(key))
          .map(([key, value]) => {
            // A calendar day is sent as "YYYY-MM-DD", any other date as an instant in UTC (RFC 3339).
            if (value instanceof Date) {
              value = casts[key] === "date" ? toCalendarDay(value) : value.toISOString();
            }

            return [key, value];
          })
      ) as ExtractAttributeType<R>;
    }

    if (!this.source.links.empty()) {
      obj["links"] = LinksSerializer.serializeLinks(this.source.links);
    }

    if (Object.keys(this.relationships).length > 0) {
      const rel = RelationshipsSerializer.serializeRelationships(this.source.relationships, this.relationships);
      if (rel && Object.entries(rel).length > 0) {
        obj["relationships"] = rel;
      }
    }

    return obj;
  }

  serializeIncluded(): ResourceDto[] {
    return [...new Set(this.included.flatMap((item) => item.asIncluded()))];
  }

  toIdentifier(): ResourceIdentifierDto {
    const obj: ResourceIdentifierDto = {
      id: this.source.id,
      type: this.source.type
    };

    if (!this.source.meta.empty()) {
      obj["meta"] = MetaSerializer.serializeMeta(this.source.meta);
    }

    return obj;
  }
}
