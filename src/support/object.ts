/**
 * Reads a value by a dotted path ("page.total", "items.0.name").
 * A key that itself contains dots is found first, then the path is walked one segment at a time.
 * Returns `undefined` as soon as a segment is missing.
 */
export const getByPath = (source: unknown, path: string): unknown => {
  if (typeof source !== "object" || source === null) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(source, path)) {
    return (source as Record<string, unknown>)[path];
  }

  return path.split(".").reduce<unknown>((value, segment) => {
    if (typeof value !== "object" || value === null || !Object.prototype.hasOwnProperty.call(value, segment)) {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, source);
};
