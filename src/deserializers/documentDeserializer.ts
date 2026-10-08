import { JsonapiDocument, JsonapiResource } from "../models";
import { MetaDeserializer } from "./metaDeserializer";
import { ErrorsDeserializer } from "./errorsDeserializer";
import { LinksDeserializer } from "./linksDeserializer";
import { JsonapiDeserializer } from "./jsonapiDeserializer";
import { DataDeserializer } from "./dataDeserializer";
import { ResourceDeserializer } from "./resourceDeserializer";
import { DocumentDto, ExtractAttributeType } from "../types";
import { Dictionary, jsonapiDictionary } from "../services";

export class DocumentDeserializer {
  static decodeDocument<M extends JsonapiResource>(
    doc: JsonapiDocument<M>,
    source: DocumentDto<ExtractAttributeType<M>>,
    dictionary: Dictionary = jsonapiDictionary
  ): JsonapiDocument<M> {
    if (source.meta) {
      MetaDeserializer.decodeMeta(doc.meta, source.meta);
    }
    if (source.jsonapi) {
      JsonapiDeserializer.decodeJsonapi(doc.jsonapi, source.jsonapi);
    }
    if (source.links) {
      LinksDeserializer.decodeLinks(doc.links, source.links);
    }
    if (source.data !== undefined) {
      DataDeserializer.decodeData(doc.dataObject, source.data, dictionary);
    }
    if (source.included) {
      doc.included.push(...source.included.map((item) => ResourceDeserializer.decodeResource(item, dictionary)));

      doc.createResourceTree();
    }
    if (source.errors) {
      ErrorsDeserializer.decodeErrors(doc.errors, source.errors);
    }

    return doc;
  }
}
