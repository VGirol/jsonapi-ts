import { isString, randomUuid, toArray, toDate } from "@/support";
import { JsonapiRelationships } from "./jsonapiRelationships";
import { JsonapiMeta } from "./jsonapiMeta";
import { JsonapiLinks } from "./jsonapiLinks";
import { AttributesObject, JsonapiRelationshipDataType, RelationshipsDef } from "@/types";
import { JsonapiRelationship } from "./jsonapiRelationship";

/**
 * A JSON:API resource object: its `type`, `id`, attributes, relationships, meta and links.
 *
 * Extend it to describe a model of your API, then register the class in a {@link Dictionary} so that the decoded
 * resources of that type are instances of it.
 *
 * @typeParam A - The attributes of the resource.
 * @typeParam R - The related resources, by relationship name, as decoded from `included`.
 *
 * @example
 * ```ts
 * type ArticleAttributes = { title: string; publishedOn: Date | null };
 * type ArticleRelationships = { author: Person; comments: Comment[] };
 *
 * class Article extends JsonapiResource<ArticleAttributes, ArticleRelationships> {
 *   cast() {
 *     return { title: "string", publishedOn: "date" };
 *   }
 * }
 *
 * jsonapiDictionary.add("articles", Article);
 * ```
 */
export class JsonapiResource<
  A extends AttributesObject = AttributesObject,
  R extends RelationshipsDef = RelationshipsDef
> {
  /** The resource id. An empty string for a resource not yet saved. */
  id = "";
  /** The resource type, e.g. `"articles"`. */
  type = "";
  /** The attributes, already converted by the casts of {@link JsonapiResource.cast}. */
  attributes: A = {} as A;
  /** The relationships of the resource. */
  relationships = new JsonapiRelationships();
  /** The `meta` member of the resource. */
  meta: JsonapiMeta = new JsonapiMeta();
  /** The `links` member of the resource. */
  links = new JsonapiLinks();
  private _tempId?: string;

  /**
   * Creates a plain `JsonapiResource`. To get an instance of the class registered for the type, use
   * {@link ResourceFactory.from}.
   *
   * @param type - The resource type.
   * @param id - The resource id, or `""` for a new resource.
   * @param data - The attributes to set.
   */
  static from<A extends AttributesObject = AttributesObject>(
    type: string,
    id: string,
    data?: Partial<A>
  ): JsonapiResource<A> {
    const obj = new JsonapiResource<A>();
    obj.fillWith(type, id, data);

    return obj;
  }

  /**
   * Sets the type, the id and some attributes.
   *
   * @param type - The resource type.
   * @param id - The resource id; `null` gives an empty id, i.e. a resource not yet saved.
   * @param data - The attributes to set, as is (no cast).
   */
  fillWith(type: string, id: string | null, data?: Partial<A>): void {
    this.type = type;
    this.id = isString(id) ? id : "";
    if (typeof data !== "undefined") {
      this.setAttributes(data);
    }
  }

  /**
   * Returns a new temporary id (a v4 UUID) for a resource not yet saved, e.g. `resource.id = resource.getTempId()`.
   * The resource remembers it, so that `isTempResource()` still holds while the id is this one.
   */
  getTempId(): string {
    this._tempId = randomUuid();

    return this._tempId;
  }

  /**
   * A resource is temporary (not yet saved) when its id is empty, or is the one given by `getTempId()`.
   * An id that merely looks like a UUID is not temporary: servers may use UUIDs.
   * The id of a temporary resource is not sent to the server, unless the serializer allows client-generated ids
   * ({@link AbstractSerializer.withClientGeneratedId}).
   */
  isTempResource(): boolean {
    return this.id === "" || (typeof this._tempId !== "undefined" && this.id === this._tempId);
  }

  /** Whether the resource has at least one attribute. */
  hasAttributes(): boolean {
    return Object.keys(this.attributes).length !== 0;
  }

  /** Sets one attribute, as is (no cast). */
  setAttribute<U extends keyof A>(name: U, value: A[U]): void {
    this.attributes[name] = value;
  }

  /** Sets several attributes, as is (no cast). The other attributes are kept. */
  setAttributes(source: Partial<A>): void {
    for (const [key, value] of Object.entries(source)) {
      this.setAttribute(key as keyof A, value as A[keyof A]);
    }
  }

  /** Returns the value of an attribute. */
  attribute<U extends keyof A>(name: U): A[U] {
    return this.attributes[name];
  }

  /**
   * Declares how attributes are converted when a resource is decoded, as `{ attribute: "cast" }`.
   * Override it in a model. The casts are a choice of this library, not part of the JSON:API specification:
   * see `castValue()`.
   */
  cast(): Record<keyof A, string> {
    return {} as Record<keyof A, string>;
  }

  /**
   * Applies the casts of {@link JsonapiResource.cast} to some raw attributes. Used when the resource is decoded.
   *
   * @returns The attributes, with the declared casts applied.
   */
  castAttributes(source: Partial<A>): Partial<A> {
    const casts = this.cast();
    const casted = {} as Partial<A>;
    (Object.keys(source) as (keyof A)[]).forEach((key) => {
      casted[key] =
        typeof casts[key] === "undefined" ? source[key] : (this.castValue(source[key], casts[key]) as A[keyof A]);
    });

    return casted;
  }

  /**
   * Converts a decoded attribute value. JSON:API does not define date types: these casts are a choice of this library.
   *
   * - `"boolean"` / `"bool"`: any truthy value gives `true`.
   * - `"date"`: a calendar day (`"YYYY-MM-DD"`), read as the **local** midnight of that day, so that the day shown
   *   never shifts with the time zone. It is sent back as `"YYYY-MM-DD"` (the local day of the `Date`).
   * - `"datetime"`: an instant (RFC 3339, e.g. `"2024-02-29T23:30:00Z"`), read with `new Date()`. It is sent back in UTC
   *   with `toISOString()`.
   *
   * A missing `date` or `datetime` gives `null`. Any other cast leaves the value unchanged.
   */
  castValue(value: unknown, type: string): unknown {
    switch (type) {
      case "boolean":
      case "bool":
        return !!value;
      case "date":
        return isString(value) ? toDate(value) : null;
      case "datetime":
        return isString(value) ? new Date(value) : null;
    }

    return value;
  }

  /**
   * Links the relationships of the resource to the matching resources of `included`. Called by
   * {@link JsonapiDocument.createResourceTree}.
   */
  createRelatedTree(included: JsonapiResource[]): void {
    this.relationships.createRelatedTree(included);
  }

  /**
   * Whether a related resource has the given id.
   *
   * @param type - The relationship name, or a dotted path through relationships (`"author.company"`).
   * @param id - The id to look for.
   */
  isRelatedTo(type: string, id: number | string): boolean {
    const relationships = type.split(".");
    const name = relationships.shift() as string;

    const rel = this.getRelated(name) as JsonapiResource[] | JsonapiResource;

    if (relationships.length === 0) {
      if (Array.isArray(rel)) {
        return rel.filter((item) => item.id === String(id)).length > 0;
      }

      return rel.id === String(id);
    }

    if (Array.isArray(rel)) {
      return rel.filter((item) => item.isRelatedTo(relationships.join("."), id)).length > 0;
    }

    return rel.isRelatedTo(relationships.join("."), id);
  }

  /**
   * Returns a relationship.
   *
   * @throws Error when the resource has no relationship with this name.
   */
  relationship(name: string): JsonapiRelationship {
    return this.relationships.get(name);
  }

  /**
   * Returns the related resources of a relationship: a resource or `null` for a to-one relationship, an array for a
   * to-many one.
   *
   * @param relationshipName - The relationship name.
   * @param id - For a to-many relationship, keeps only the resources with this id (or one of these ids).
   * @throws Error when the resource has no relationship with this name.
   */
  getRelated(relationshipName: string, id?: string | string[]): JsonapiRelationshipDataType | undefined {
    return this.relationship(relationshipName).getRelated(id);
  }

  /**
   * Returns the related resource of a to-one relationship, or one resource of a to-many relationship.
   *
   * @param relationshipName - The relationship name.
   * @param id - Required for a to-many relationship: the id of the resource to return.
   * @returns The resource, `null` for an empty to-one relationship, or `undefined` when it was not decoded.
   * @throws Error when the resource has no relationship with this name, or when `id` is missing for a to-many one.
   */
  getSingleRelated<K extends keyof R>(relationshipName: K, id?: string | string[]): null | R[K] | undefined {
    return this.relationship(relationshipName as string).getSingleRelated(id) as R[K];
  }

  /**
   * Returns the related resources of a to-many relationship.
   *
   * @throws Error when the resource has no relationship with this name, or when it is a to-one relationship.
   */
  getManyRelated<K extends keyof R>(relationshipName: K): R[K] | undefined {
    return this.relationship(relationshipName as string).getManyRelated() as R[K];
  }

  /** Sets the related resource of a to-one relationship, creating the relationship if needed. */
  setRelated(relationshipName: string, related: JsonapiResource | null): void {
    this.addRelated(relationshipName, related, false);
  }

  /**
   * Adds related resources to a relationship, creating it if needed.
   *
   * @param relationshipName - The relationship name.
   * @param related - The resources to add (or `null` to empty a to-one relationship).
   * @param isToMany - Whether the relationship is to-many, when it has to be created.
   */
  addRelated(relationshipName: string, related: JsonapiResource[] | JsonapiResource | null, isToMany: boolean): void {
    toArray(related)
      .filter((item) => item !== null)
      .forEach((item) => this.syncRelated(item));
    this.relationships.getOrCreate(relationshipName, isToMany).addRelated(related);
  }

  /**
   * Called for each resource added by {@link JsonapiResource.addRelated}. Does nothing by default: override it to
   * keep the model in sync with its relationships (a foreign key attribute, for example).
   */
  syncRelated(_related: JsonapiResource): void {
    //
  }

  /**
   * Removes related resources from a relationship.
   *
   * @param relationshipName - The relationship name.
   * @param id - The id (or ids, for a to-many relationship) of the resources to remove.
   */
  removeRelated(relationshipName: string, id: string | string[]): void {
    this.relationships.get(relationshipName).removeRelated(id);
  }

  /** Adds a member to the `meta` of the resource. */
  addMeta(key: string, value: unknown): void {
    this.meta.add(key, value);
  }

  /**
   * Whether the resource has this numeric id. Both ids are compared as integers.
   *
   * @param key - The id to compare with; `null` never matches.
   */
  isKeyed(key: string | number | null): boolean {
    if (key === null) {
      return false;
    }
    key = isString(key) ? parseInt(key) : key;

    return parseInt(this.id) === key;
  }
}
