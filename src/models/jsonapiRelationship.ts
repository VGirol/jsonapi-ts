import { toArray } from "@/support";
import { JsonapiMeta } from "./jsonapiMeta";
import { JsonapiResource } from "./jsonapiResource";
import { JsonapiRelationshipDataType, RelationshipDto } from "@/types";

/**
 * A relationship of a resource, to-one or to-many, with the related resources once they are known.
 *
 * The related resources come from the `included` member of the decoded document: a relationship whose resources
 * are not included only knows its identifiers, and {@link JsonapiRelationship.data} stays empty.
 *
 * @typeParam M - The class of the related resources.
 */
export class JsonapiRelationship<M extends JsonapiResource = JsonapiResource> {
  private source?: RelationshipDto;
  private internal?: JsonapiRelationshipDataType<M>;
  /** The `meta` member of the relationship. */
  meta: JsonapiMeta = new JsonapiMeta();
  private isToMany!: boolean;

  /** The related resources: a resource or `null` for a to-one relationship, an array for a to-many one. */
  get data(): JsonapiRelationshipDataType<M> | undefined {
    return this.internal;
  }

  /** Whether the related resources are known (not `undefined`). */
  get isDefined(): boolean {
    return typeof this.internal !== "undefined";
  }

  /** @param isToMany - Whether the relationship is to-many (the default) or to-one. */
  constructor(isToMany = true) {
    this.toMany(isToMany);
  }

  /**
   * Keeps the raw relationship of the decoded document, used by {@link JsonapiRelationship.createRelatedTree} to
   * find the related resources.
   */
  setSource(source: RelationshipDto): void {
    this.source = source;
  }

  /** Switches the relationship to to-many or to-one. The related resources are reset: `[]` or `null`. */
  toMany(isToMany: boolean): void {
    this.isToMany = isToMany;
    this.internal = isToMany ? [] : null;
  }

  /**
   * Returns the related resources.
   *
   * @param id - For a to-many relationship, keeps only the resources with this id (or one of these ids).
   */
  getRelated(id?: string | string[]): JsonapiRelationshipDataType<M> | undefined {
    if (this.isToMany && id) {
      return (this.internal as M[]).filter((item) => id === undefined || toArray(id).includes(item.id));
    }

    return this.internal;
  }

  /**
   * Returns the related resource of a to-one relationship, or one resource of a to-many relationship.
   *
   * @param id - Required for a to-many relationship: the id of the resource to return.
   * @throws Error when `id` is missing for a to-many relationship.
   */
  getSingleRelated(id?: string | string[]): null | M | undefined {
    if (this.isToMany && typeof id === "undefined") {
      throw new Error("You must provide an ID.");
    }

    if (typeof this.internal === "undefined" || this.internal === null) {
      return this.internal;
    }

    if (this.isToMany) {
      if (!Array.isArray(this.internal)) {
        throw new Error("Internal data is not an array.");
      }

      return this.internal.filter((item) => toArray(id).includes(item.id))[0];
    }

    if (Array.isArray(this.internal)) {
      throw new Error("Internal data is an array.");
    }

    return this.internal;
  }

  /**
   * Returns the related resources of a to-many relationship.
   *
   * @throws Error for a to-one relationship.
   */
  getManyRelated(): M[] | undefined {
    if (!this.isToMany || this.internal === null) {
      throw new Error("Relationship is not to-many.");
    }

    if (typeof this.internal === "undefined") {
      return this.internal;
    }

    if (!Array.isArray(this.internal)) {
      throw new Error("Internal data is not an array.");
    }

    return this.internal;
  }

  /**
   * Adds related resources: appended for a to-many relationship, replaced for a to-one one.
   *
   * @throws TypeError when adding `null` to a to-many relationship, or an array to a to-one one.
   */
  addRelated(related: JsonapiRelationshipDataType<M>): void {
    if (this.isToMany) {
      if (related === null) {
        throw new TypeError("Cannot add null related resource to to-many relationship.");
      }

      (this.internal as M[]).push(...toArray(related));
    } else {
      if (Array.isArray(related)) {
        throw new TypeError("Cannot add multiple related resources to to-one relationship.");
      }

      this.internal = related;
    }
  }

  /**
   * Removes related resources by id. A to-one relationship becomes `null` when its resource is removed.
   *
   * @throws TypeError when removing several resources from a to-one relationship.
   */
  removeRelated(id: string | string[]): void {
    if (this.internal === null) {
      return;
    }

    if (this.isToMany) {
      this.internal = (this.internal as M[]).filter((item) => !toArray(id).includes(item.id));

      return;
    }

    if (Array.isArray(id)) {
      throw new TypeError("Cannot remove multiple related resources from to-one relationship.");
    }
    if ((this.internal as M).id === id) {
      this.internal = null;
    }
  }

  /**
   * Finds the related resources in `included`, from the identifiers of the decoded relationship. An identifier
   * without a matching included resource is left out.
   *
   * @param included - The included resources of the document.
   */
  createRelatedTree(included: M[]): void {
    if (this.source === undefined) {
      return;
    }

    const sourceData = this.source.data;
    if (typeof sourceData === "undefined") {
      return;
    }
    if (sourceData === null) {
      this.toMany(false);
      this.internal = null;

      return;
    }

    if (Array.isArray(sourceData)) {
      this.toMany(true);
      const ids = sourceData.reduce((prev, curr) => {
        prev.push(curr.id);

        return prev;
      }, [] as string[]);
      const type = sourceData.reduce((prev, curr) => {
        return curr.type;
      }, "");
      this.internal = included.filter((item) => item.type === type && ids.includes(item.id));

      return;
    }

    this.toMany(false);
    this.internal = included.find((item) => item.type === sourceData.type && item.id == sourceData.id);
  }

  /**
   * Maps the related resources of a to-many relationship.
   *
   * @throws Error for a to-one relationship.
   */
  map(cb: (value: JsonapiResource, index: number, array: JsonapiResource[]) => unknown): unknown[] {
    if (!Array.isArray(this.internal)) {
      throw Error();
    }

    return this.internal.map(cb);
  }
}
