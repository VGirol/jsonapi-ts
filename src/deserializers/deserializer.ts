import { JsonapiDocument, JsonapiResource } from "@/models";
import { DocumentDeserializer } from "./documentDeserializer";
import { DocumentDto, ExtractAttributeType } from "@/types";
import { Dictionary, jsonapiDictionary } from "@/services";

/** Decodes JSON:API documents into models. */
export class Deserializer {
  /**
   * Decodes a JSON:API document into models.
   *
   * Each resource of `data` and `included` is an instance of the class registered for its type in the dictionary.
   * When the document has `included` resources, the relationships are linked to them (see
   * {@link JsonapiDocument.createResourceTree}).
   *
   * @param source - The document, as an object or as a JSON string.
   * @param dictionary - The classes to instantiate for each resource type (the shared `jsonapiDictionary` by default).
   * @returns The decoded document.
   */
  static decode<M extends JsonapiResource>(
    source: DocumentDto<ExtractAttributeType<M>> | string,
    dictionary: Dictionary = jsonapiDictionary
  ): JsonapiDocument<M> {
    return DocumentDeserializer.decodeDocument(
      new JsonapiDocument<M>(),
      typeof source === "string" ? JSON.parse(source) : source,
      dictionary
    );
  }
}
