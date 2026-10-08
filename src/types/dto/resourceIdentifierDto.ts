import { MetaDto } from "./metaDto";

/** The raw JSON shape of a resource identifier: the `type` and `id` of a resource. */
export interface ResourceIdentifierDto {
  /** The resource id. */
  id: string;
  /** The resource type. */
  type: string;
  /** The identifier meta. */
  meta?: MetaDto;
}
