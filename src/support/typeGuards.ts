export const isString = function (test: unknown): test is string {
  return typeof test === "string" || test instanceof String;
};
