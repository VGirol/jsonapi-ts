import { JsonapiDataType, MetaDto } from "@/types";
import { JsonapiData } from "./jsonapiData";
import { JsonapiErrors } from "./jsonapiErrors";
import { JsonapiJsonapi } from "./jsonapiJsonapi";
import { JsonapiLinks } from "./jsonapiLinks";
import { JsonapiMeta } from "./jsonapiMeta";
import { JsonapiResource } from "./jsonapiResource";
import { Serializer } from "@/serializers";

/**
 * A JSON:API top-level document: primary data, included resources, errors, meta, links and `jsonapi` member.
 *
 * @typeParam R - The class of the primary resources.
 * @typeParam M - The shape of the document `meta`.
 */
export class JsonapiDocument<R extends JsonapiResource = JsonapiResource, M extends MetaDto = MetaDto> {
  private internal_data = new JsonapiData<R>();
  /** The `errors` member: empty unless the server answered with errors. */
  errors = new JsonapiErrors();
  /** The `jsonapi` member (version and meta). */
  jsonapi = new JsonapiJsonapi();
  /** The `meta` member of the document. */
  meta = new JsonapiMeta<M>();
  /** The `links` member of the document. */
  links = new JsonapiLinks();
  /** The `included` resources, already linked to the relationships that refer to them. */
  included: JsonapiResource[] = [];

  /** The container of the primary data. */
  get dataObject(): JsonapiData<R> {
    return this.internal_data;
  }

  /**
   * The primary data: a resource, an array of resources, `null`, or `undefined` when the document has no `data`
   * member.
   */
  get data(): JsonapiDataType<R> {
    return this.internal_data.get();
  }

  /**
   * The primary data, when it is a single resource.
   *
   * @throws Error when the primary data is not a single resource.
   */
  get dataAsResource(): R {
    return this.internal_data.getAsResource();
  }

  /** Sets the version of the `jsonapi` member. */
  setJsonApiVersion(version: string): void {
    this.jsonapi.setVersion(version);
  }

  /** Serializes the document to a JSON string. */
  toJson(): string {
    return JSON.stringify(Serializer.source(this).toDocument());
  }

  /**
   * Links the relationships of the primary data and of the included resources to the included resources. Called by
   * the deserializer when the document has an `included` member.
   */
  createResourceTree(): void {
    this.included.forEach((item) => item.createRelatedTree(this.included));

    this.internal_data.createResourceTree(this.included);
  }
}
