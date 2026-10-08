import { JsonapiDocument, JsonapiRelationship, JsonapiResource } from "@/models";
import { MetaDto } from "./dto";

/** What {@link Serializer.source} accepts: a resource, a relationship or a document. */
export type SourceType<R extends JsonapiResource, M extends MetaDto> =
  | R
  | JsonapiRelationship<R>
  | JsonapiDocument<R, M>;
