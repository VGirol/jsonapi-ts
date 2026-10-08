import { merge } from "ts-deepmerge";
import { isString, toArray } from "@/support";
import { JsonapiResource } from "../models";
import {
  DocumentDto,
  ExtractAttributeType,
  MetaDto,
  RawRequestedIncluded,
  RawRequestedRelationships,
  RequestedRelationships,
  ResourceDto,
  SourceType
} from "../types";

/**
 * A serializer returned by {@link Serializer.source}. Its `with...` methods choose what is serialized and return the
 * serializer, so that they can be chained.
 *
 * By default, every attribute is serialized and no relationship. The id of a temporary resource
 * ({@link JsonapiResource.isTempResource}) is left out.
 */
export abstract class AbstractSerializer<R extends JsonapiResource, M extends MetaDto, S extends SourceType<R, M> = R> {
  /** The resource, relationship or document to serialize. */
  source: S;
  /** The attributes to serialize; empty means all of them. */
  attributes: string[] = [];
  /** Whether the attributes are left out. */
  noAttributes: boolean = false;
  /** The relationships to serialize, as a tree of names. */
  relationships: RequestedRelationships = {};
  /** Whether the id of a temporary resource is sent. */
  clientGeneratedIdAllowed: boolean = false;

  /** @param source - The resource, relationship or document to serialize. */
  constructor(source: S) {
    this.source = source;
  }

  /**
   * Adds relationships to serialize, as resource identifiers in the `relationships` member.
   *
   * @param names - A name, an array of names, or a tree of names. A dotted path (`"author.company"`) also serializes
   *   the
   *   relationships of the related resources, when they are included.
   */
  withRelationships(names: RawRequestedRelationships): this {
    this.relationships = merge(this.relationships, this.parseRequestedRelationships(names));

    return this;
  }

  /** Serializes only these attributes. Successive calls add to the list. */
  withOnlyAttributes(values: string | string[]): this {
    this.attributes = [...new Set(this.attributes.concat(toArray(values)))];

    return this;
  }

  /** Leaves the attributes out, e.g. to send only relationships. */
  withoutAttributes(): this {
    this.noAttributes = true;

    return this;
  }

  /** Serializes the attributes again, after {@link AbstractSerializer.withoutAttributes}. */
  withAttributes(): this {
    this.noAttributes = false;

    return this;
  }

  /**
   * Sends the id of a temporary resource (see {@link JsonapiResource.getTempId}), for a server that accepts
   * client-generated ids.
   */
  withClientGeneratedId(): this {
    this.clientGeneratedIdAllowed = true;

    return this;
  }

  /** Leaves the id of a temporary resource out again (the default). */
  withoutClientGeneratedId(): this {
    this.clientGeneratedIdAllowed = false;

    return this;
  }

  /**
   * Adds related resources to the `included` member of the document.
   *
   * @param included - The relationships to include, each with the relationships of the included resources to serialize,
   *   e.g. `{ author: ["company"] }`.
   * @throws Error for a document or a relationship: only a resource has included resources.
   */
  abstract withIncluded(included: RawRequestedIncluded): this;

  /** Returns the serialized document. */
  abstract toDocument(): DocumentDto<ExtractAttributeType<R>>;

  /** Returns the serialized resources, as they appear in an `included` member. */
  abstract asIncluded(): ResourceDto[];

  // static source<R extends JsonapiResource, S extends SourceType<R>, T extends AbstractSerializer<R, S>>(
  //   this: { new (source: S): T },
  //   source: S
  // ) {
  //   return new this(source);
  // }

  /** Turns names, dotted paths or arrays of them into a tree of relationship names. */
  protected parseRequestedRelationships(relationships?: RawRequestedRelationships): RequestedRelationships {
    if (typeof relationships === "undefined") {
      return {};
    }
    if (isString(relationships)) {
      relationships = [relationships];
    }
    if (!Array.isArray(relationships)) {
      return relationships as RequestedRelationships;
    }

    const obj = {} as RequestedRelationships;
    relationships.forEach((item) => {
      const arr = item.split(".");
      const key = arr.shift();
      if (key === undefined) {
        return;
      }

      const other = arr.length !== 0 ? this.parseRequestedRelationships(arr) : {};
      obj[key] = {
        ...(obj[key] || {}),
        ...other
      };
    });

    return obj;
  }
}
