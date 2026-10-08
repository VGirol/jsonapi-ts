import { JsonapiResource } from "@/models";
import { AttributesObject } from "@/types";

/** Whether a value is a resource or an array of resources. */
export const isValidResource = <A extends AttributesObject>(
  value: unknown
): value is JsonapiResource<A> | JsonapiResource<A>[] => {
  if (value instanceof JsonapiResource) {
    return true;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return value.reduce((prev, curr): boolean => prev && curr instanceof JsonapiResource, true);
};

/** Whether a value is a single resource. */
export const isValidSingleResource = <A extends AttributesObject>(value: unknown): value is JsonapiResource<A> => {
  return isValidResource(value) && !Array.isArray(value);
};
