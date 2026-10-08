import { JsonapiDocument, JsonapiResource } from "../models";
import { JsonapiDocumentCollection } from "../types";

/** Whether a value is a document whose primary data is an array of resources. */
export const isDocumentWithManyResources = <M extends JsonapiResource>(
  doc: unknown
): doc is JsonapiDocumentCollection<M> => {
  return (
    doc instanceof JsonapiDocument && typeof doc.data !== "undefined" && doc.data !== null && Array.isArray(doc.data)
  );
};
