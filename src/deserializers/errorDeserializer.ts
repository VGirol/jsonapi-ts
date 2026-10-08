import { JsonapiErrorObject } from "../models";
import { ErrorDto } from "../types";
import { ErrorSourceDeserializer } from "./errorSourceDeserializer";
import { LinksDeserializer } from "./linksDeserializer";
import { MetaDeserializer } from "./metaDeserializer";

export class ErrorDeserializer {
  static decodeError(error: JsonapiErrorObject, source: ErrorDto): void {
    if (source.id) {
      error.id = source.id;
    }
    if (source.status) {
      error.status = source.status;
    }
    if (source.code) {
      error.code = source.code;
    }
    if (source.title) {
      error.title = source.title;
    }
    if (source.detail) {
      error.detail = source.detail;
    }
    if (source.links) {
      LinksDeserializer.decodeLinks(error.links, source.links);
    }
    if (source.source) {
      ErrorSourceDeserializer.decodeErrorSource(error.source, source.source);
    }
    if (source.meta) {
      MetaDeserializer.decodeMeta(error.meta, source.meta);
    }
  }
}
