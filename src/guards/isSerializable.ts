import { JsonapiDocument, JsonapiRelationship, JsonapiResource } from "@/models";
import { MetaDto, SourceType } from "@/types";

/** Whether a value can be given to {@link Serializer.source}: a resource, a relationship or a document. */
export const isSerializable = function <R extends JsonapiResource, M extends MetaDto = MetaDto>(
  test: unknown
): test is SourceType<R, M> {
  return (
    (typeof test === "object" && test !== null && test instanceof JsonapiResource) ||
    test instanceof JsonapiRelationship ||
    test instanceof JsonapiDocument
  );
};
