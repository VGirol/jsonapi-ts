import { JsonapiDocument, JsonapiResource } from "@/models";
import { JsonapiDocumentSingle } from "@/types";

/** Whether a value is a document whose primary data is a single resource or `null`. */
export const isDocumentWithSingleResource = <M extends JsonapiResource>(
  doc: unknown
): doc is null | JsonapiDocumentSingle<M> => {
  return (
    doc instanceof JsonapiDocument &&
    typeof doc.data !== "undefined" &&
    !Array.isArray(doc.data) &&
    (doc.data === null || doc.data instanceof JsonapiResource)
  );
};
