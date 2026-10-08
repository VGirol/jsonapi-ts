import { isSerializable } from "@/guards";
import { FetchAdapterOptionsWithInit, RequestInterceptor } from "../types";
import { Serializer } from "@/serializers";
import { isJsonBody } from "./jsonBody";

export const RequestDataInterceptor: RequestInterceptor = (
  options: FetchAdapterOptionsWithInit
): FetchAdapterOptionsWithInit => {
  if (isSerializable(options.data)) {
    options.data = JSON.stringify(Serializer.source(options.data).toDocument());
  } else if (isJsonBody(options.data) && typeof options.data !== "string") {
    // A document already serialized, e.g. Serializer.source(model).withRelationships([...]).toDocument()
    options.data = JSON.stringify(options.data);
  }

  return options;
};
