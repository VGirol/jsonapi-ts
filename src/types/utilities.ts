import { JsonapiResource } from "@/models";
import { AttributesObject } from "./attributesObject";
import { RelationshipsDef } from "./types";

/** The attributes type of a model class, e.g. `ExtractAttributeType<Article>`. */
export type ExtractAttributeType<M> =
  M extends JsonapiResource<infer A, infer _R> ? (A extends AttributesObject ? A : never) : never;

/** The relationships type of a model class, e.g. `ExtractRelationshipsType<Article>`. */
export type ExtractRelationshipsType<M> =
  M extends JsonapiResource<infer _A, infer R> ? (R extends RelationshipsDef ? R : never) : never;
