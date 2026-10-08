import { MetaDto } from "@/types";
import { getByPath } from "@/support";

/**
 * A `meta` member: free-form data, read by key or by dotted path.
 *
 * @typeParam M - The shape of the meta object.
 */
export class JsonapiMeta<M extends MetaDto = MetaDto> {
  private internal: M = {} as M;

  /** Sets a member. */
  add<P extends keyof M>(key: P, value: M[P]): void {
    this.internal[key] = value;
  }

  /** Whether there is no member. */
  empty(): boolean {
    return Object.keys(this.internal).length === 0;
  }

  /** Whether a top-level member is set (and not `undefined`). */
  hasKey(key: string): boolean {
    return typeof this.internal[key] !== "undefined";
  }

  /**
   * Reads a member by key or by dotted path (`"page.total"`, `"items.0.name"`). A key that itself contains dots is
   * found first.
   *
   * @returns The value, or `undefined` when a segment of the path is missing.
   */
  value<P extends keyof M>(path: P): M[P] {
    return getByPath(this.internal, path as string) as M[P];
  }

  /** Returns a shallow copy of the meta object. */
  toDTO(): M {
    return Object.assign({}, this.internal);
  }
}
