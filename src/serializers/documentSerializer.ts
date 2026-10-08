import { DocumentDto, ExtractAttributeType, MetaDto, RawRequestedIncluded, ResourceDto } from "../types";
import { JsonapiDocument, JsonapiResource } from "../models";
import { MetaSerializer } from "./metaSerializer";
import { JsonapiSerializer } from "./jsonapiSerializer";
import { LinksSerializer } from "./linksSerializer";
import { ErrorsSerializer } from "./errorsSerializer";
import { DataSerializer } from "./dataSerializer";
import { AbstractSerializer } from "./abstractSerializer";

export class DocumentSerializer<R extends JsonapiResource, M extends MetaDto> extends AbstractSerializer<
  R,
  M,
  JsonapiDocument<R, M>
> {
  withIncluded(_included: RawRequestedIncluded): this {
    throw new Error("Not allowed !");
  }

  toDocument(): DocumentDto<ExtractAttributeType<R>> {
    const dto: DocumentDto<ExtractAttributeType<R>> = {};

    if (!this.source.meta.empty()) {
      dto["meta"] = MetaSerializer.serializeMeta<M>(this.source.meta);
    }

    if (!this.source.jsonapi.empty()) {
      dto["jsonapi"] = JsonapiSerializer.serializeJsonapi(this.source.jsonapi);
    }

    if (!this.source.links.empty()) {
      dto["links"] = LinksSerializer.serializeLinks(this.source.links);
    }

    if (!this.source.dataObject.isEmpty()) {
      dto["data"] = DataSerializer.serializeData(this.source.dataObject, this.relationships);
      const included = DataSerializer.serializeIncluded(this.source.dataObject, this.relationships);
      if (included.length > 0) {
        dto["included"] = included;
      }
    }

    if (!this.source.errors.empty()) {
      dto["errors"] = ErrorsSerializer.serializeErrors(this.source.errors);
    }

    return dto;
  }

  asIncluded(): ResourceDto[] {
    throw Error("Not allowed !");
  }
}
