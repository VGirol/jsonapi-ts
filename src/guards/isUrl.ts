import { isString } from "@/support";
import { UrlOptions, UrlType } from "@/types";

export const isUrl = function (test: unknown): test is UrlType {
  return isString(test) || (typeof test === "object" && test !== null && typeof (test as UrlOptions).path === "string");
};
