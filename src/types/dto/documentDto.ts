import { AttributesObject } from "../attributesObject";
import { ErrorDto } from "./errorDto";
import { JsonapiDto } from "./jsonapiDto";
import { LinksDto } from "./linksDto";
import { MetaDto } from "./metaDto";
import { ResourceDto } from "./resourceDto";
import { ResourceIdentifierDto } from "./resourceIdentifierDto";

/** The raw `data` member of a document: resources, resource identifiers, or `null`. */
export declare type DtoDataType<A extends AttributesObject = AttributesObject> =
  | null
  | ResourceDto<A>
  | ResourceDto<A>[]
  | ResourceIdentifierDto
  | ResourceIdentifierDto[];

/**
 * The raw JSON shape of a JSON:API top-level document, as sent or received.
 *
 * @typeParam A - The attributes of the primary resources.
 * @typeParam M - The shape of the document `meta`.
 */
export interface DocumentDto<A extends AttributesObject = AttributesObject, M extends MetaDto = MetaDto> {
  /** The primary data. */
  data?: DtoDataType<A>;
  /** The error objects. */
  errors?: ErrorDto[];
  /** The `jsonapi` member. */
  jsonapi?: JsonapiDto;
  /** The document meta. */
  meta?: M;
  /** The document links. */
  links?: LinksDto;
  /** The included resources. */
  included?: ResourceDto[];
}
