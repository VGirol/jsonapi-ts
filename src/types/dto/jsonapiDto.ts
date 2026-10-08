import { MetaDto } from "./metaDto";

/** The raw `jsonapi` member of a document. */
export interface JsonapiDto {
  /** The JSON:API version. */
  version?: string;
  /** The meta of the `jsonapi` member. */
  meta?: MetaDto;
}
