import { JsonapiResource } from "@/models";

/** The primary data of a document: a resource, an array of resources, `null`, or `undefined` when missing. */
export declare type JsonapiDataType<M extends JsonapiResource> = M | M[] | null | undefined;

/** The related resources of a relationship: a resource or `null` (to-one), or an array (to-many). */
export declare type JsonapiRelationshipDataType<M extends JsonapiResource = JsonapiResource> = null | M | M[];

/** A tree of relationship names, e.g. `{ author: { company: {} } }`. */
export declare type RequestedRelationships = Record<string, NonNullable<unknown>>;
/**
 * Relationship names as accepted by {@link AbstractSerializer.withRelationships}: a name, an array of names (dotted
 * paths allowed) or a tree.
 */
export declare type RawRequestedRelationships =
  | RequestedRelationships
  | string[]
  | string
  | Readonly<string[]>
  | Readonly<string>;
/**
 * Relationships to include, as accepted by {@link AbstractSerializer.withIncluded}: for each relationship, the
 * relationships of the included resources to serialize.
 */
export declare type RawRequestedIncluded = Record<string, RawRequestedRelationships>;

/**
 * The related resources of a model, by relationship name: a resource for a to-one relationship, an array for a to-many
 * one. Used as the second type parameter of {@link JsonapiResource}.
 */
export interface RelationshipsDef {
  /** The related resource or resources of a relationship. */
  [key: string]: JsonapiResource | JsonapiResource[];
}

/** A model class that can be registered in a {@link Dictionary}: it must have a constructor without arguments. */
export interface ResourceClass<M extends JsonapiResource> {
  /** Creates an empty resource. */
  new (): M;
}

export declare type ResourceCtorDictionary = Record<string, ResourceClass<JsonapiResource>>;
