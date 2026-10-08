import { JsonapiDocument } from "@/models";
import { FetchAdapterOptionsWithInit, RequestInterceptor } from "../types";

export const RequestJsonapiVersionInterceptor: RequestInterceptor = (
  options: FetchAdapterOptionsWithInit
): FetchAdapterOptionsWithInit => {
  // Set jsonapi version
  if (typeof options.data !== "undefined" && options.data instanceof JsonapiDocument) {
    options.data.setJsonApiVersion("1.0");
  }

  return options;
};
