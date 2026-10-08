import { DocumentSerializer } from "./documentSerializer";
import { RelationshipSerializer } from "./relationshipSerializer";
import { ResourceSerializer } from "./resourceSerializer";
import { AbstractSerializer } from "./abstractSerializer";
import { JsonapiDocument, JsonapiRelationship, JsonapiResource } from "@/models";
import { MetaDto, SourceType } from "@/types";

/**
 * Serializes models into JSON:API documents.
 *
 * @example
 * ```ts
 * const body = Serializer.source(article)
 *   .withOnlyAttributes(["title"])
 *   .withRelationships(["author"])
 *   .toDocument();
 * ```
 */
export class Serializer {
  /**
   * Returns a serializer for a resource, a relationship or a document. Configure it with its `with...` methods, then
   * call {@link AbstractSerializer.toDocument}.
   *
   * @throws Error when the source is not a resource, a relationship or a document.
   */
  static source<R extends JsonapiResource, M extends MetaDto = MetaDto>(
    source: SourceType<R, M>
  ): AbstractSerializer<R, M, SourceType<R, M>> {
    switch (true) {
      case source instanceof JsonapiDocument:
        return new DocumentSerializer<R, M>(source);

      case source instanceof JsonapiRelationship:
        return new RelationshipSerializer<R>(source);

      case source instanceof JsonapiResource:
        return new ResourceSerializer<R, M>(source);

      default:
        throw new Error("Serializer source must be JsonapiDocument, JsonapiRelationship, or JsonapiResource.");
    }
  }
}
