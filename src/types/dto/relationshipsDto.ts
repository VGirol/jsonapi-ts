import { LinksDto } from "./linksDto";
import { MetaDto } from "./metaDto";
import { ResourceIdentifierDto } from "./resourceIdentifierDto";

/** A raw `relationships` member: relationships by name. */
export declare type RelationshipsDto = Record<string, RelationshipDto>;

/** The raw JSON shape of a relationship object. */
export interface RelationshipDto {
  /** The resource linkage: an identifier or `null` for a to-one relationship, an array for a to-many one. */
  data?: null | ResourceIdentifierDto | ResourceIdentifierDto[];
  /** The relationship meta. */
  meta?: MetaDto;
  /** The relationship links (`self`, `related`). */
  links?: LinksDto;
}
