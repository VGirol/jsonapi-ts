import { JsonapiLink } from "./jsonapiLink";

/** A `links` member: links by name (`self`, `related`, `first`, `next`...). */
export class JsonapiLinks {
  private internal: Record<string, JsonapiLink> = {};

  /** Sets a link. */
  add(key: string, link: JsonapiLink): void {
    this.internal[key] = link;
  }

  /** Whether there is no link. */
  empty(): boolean {
    return Object.keys(this.internal).length === 0;
  }

  /** All the links, by name. */
  all(): Record<string, JsonapiLink> {
    return this.internal;
  }
}
