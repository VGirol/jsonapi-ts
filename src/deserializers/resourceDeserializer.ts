import { ResourceDto } from "../types";
import { JsonapiResource } from "../models";
import { MetaDeserializer } from "./metaDeserializer";
import { LinksDeserializer } from "./linksDeserializer";
import { Dictionary, jsonapiDictionary } from "../services";
import { RelationshipsDeserializer } from "./relationshipsDeserializer";
import { ExtractAttributeType } from "../types";

export class ResourceDeserializer {
  static decodeResource<M extends JsonapiResource = JsonapiResource>(
    source: ResourceDto<ExtractAttributeType<M>>,
    dictionary: Dictionary = jsonapiDictionary
  ): M {
    const res = dictionary.make<M>(source.type);
    ResourceDeserializer.decodeResourceDto(res, source);
    if (source.relationships) {
      RelationshipsDeserializer.decodeRelationships(res.relationships, source.relationships);
    }

    return res;
  }

  private static decodeResourceDto<M extends JsonapiResource>(
    resource: M,
    source: ResourceDto<ExtractAttributeType<M>>
  ): void {
    resource.type = source.type;
    resource.id = source.id ?? "";

    if (source.attributes) {
      resource.setAttributes(resource.castAttributes(source.attributes));
    }

    if (source.meta) {
      MetaDeserializer.decodeMeta(resource.meta, source.meta);
    }

    if (source.links) {
      LinksDeserializer.decodeLinks(resource.links, source.links);
    }
  }
}
