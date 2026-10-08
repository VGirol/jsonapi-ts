import { JsonapiDocument, JsonapiResource } from "@/models";
import { DocumentDto, ExtractAttributeType } from "@/types";

/**
 * The response of an adapter.
 *
 * @typeParam R - The class of the primary resources.
 * @typeParam D - The response object of the HTTP client (`Response` for `fetch`).
 */
export interface AdapterResponse<R extends JsonapiResource, D = unknown> {
  /** The HTTP status. */
  status: number;
  /** The response object of the HTTP client. */
  clientResponse: D;
  /** The raw JSON body; `undefined` for a response without body. */
  json?: DocumentDto<ExtractAttributeType<R>>;
  /** The decoded document; `undefined` for a response without body. */
  doc?: JsonapiDocument<R>;
}
