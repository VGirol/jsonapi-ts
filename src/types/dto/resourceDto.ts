import { AttributesObject } from "../attributesObject";
import { LinksDto } from "./linksDto";
import { MetaDto } from "./metaDto";
import { RelationshipsDto } from "./relationshipsDto";

/**
 * The raw JSON shape of a resource object.
 *
 * @typeParam Attr - The attributes of the resource.
 */
export interface ResourceDto<Attr extends AttributesObject = AttributesObject> {
  /** The resource type. */
  type: string;
  /** The resource id; missing for a resource created by the client. */
  id?: string;
  /** The attributes. */
  attributes?: Attr;
  /** The relationships. */
  relationships?: RelationshipsDto;
  /** The resource meta. */
  meta?: MetaDto;
  /** The resource links. */
  links?: LinksDto;
}
