import { JsonapiRelationship } from "./jsonapiRelationship";
import { JsonapiResource } from "./jsonapiResource";

/** The relationships of a resource, by name. */
export class JsonapiRelationships {
  private internal: Record<string, JsonapiRelationship> = {};

  /** All the relationships, by name. */
  get all(): Record<string, JsonapiRelationship> {
    return this.internal;
  }

  /** Whether there is no relationship. */
  empty(): boolean {
    return Object.keys(this.internal).length === 0;
  }

  /** Whether a relationship with this name exists. */
  has(name: string): boolean {
    return typeof this.internal[name] !== "undefined";
  }

  /** Returns a relationship, or `undefined` when there is none with this name. */
  find(name: string): JsonapiRelationship | undefined {
    if (!this.has(name)) {
      return;
    }

    return this.internal[name];
  }

  /**
   * Returns a relationship.
   *
   * @throws Error when there is no relationship with this name.
   */
  get(name: string): JsonapiRelationship {
    const relationship = this.find(name);

    if (typeof relationship === "undefined") {
      throw new Error(`No "${name}" relationship !`);
    }

    return relationship;
  }

  /**
   * Returns a relationship, creating it when there is none with this name.
   *
   * @param isToMany - Whether the relationship is to-many, when it has to be created.
   */
  getOrCreate(name: string, isToMany: boolean): JsonapiRelationship {
    try {
      return this.get(name);
    } catch {
      return this.add(name, isToMany);
    }
  }

  /** Creates a relationship, to-many or to-one, replacing any relationship with this name. */
  add(name: string, isToMany: boolean): JsonapiRelationship;
  /** Adds a relationship, replacing any relationship with this name. */
  add(name: string, relationship: JsonapiRelationship): JsonapiRelationship;
  add(name: string, value: boolean | JsonapiRelationship): JsonapiRelationship {
    const obj = value instanceof JsonapiRelationship ? value : new JsonapiRelationship(value);
    this.internal[name] = obj;

    return obj;
  }

  /** Calls a function for each relationship. */
  each(callback: (relationship: JsonapiRelationship, name: string) => void): void {
    for (const [name, relationship] of Object.entries(this.internal)) {
      callback(relationship, name);
    }
  }

  /** Returns the relationships for which the function returns `true`. */
  filter(callback: (relationship: JsonapiRelationship, name: string) => boolean): JsonapiRelationships {
    const results = new JsonapiRelationships();

    for (const [name, relationship] of Object.entries(this.internal)) {
      if (callback(relationship, name)) {
        results.add(name, relationship);
      }
    }

    return results;
  }

  /** Maps each relationship. */
  map<R>(callback: (relationship: JsonapiRelationship, name: string) => R): R[] {
    const results: R[] = [];

    for (const [name, relationship] of Object.entries(this.internal)) {
      results.push(callback(relationship, name));
    }

    return results;
  }

  /** Links every relationship to the matching resources of `included`. */
  createRelatedTree(included: JsonapiResource[]): void {
    for (const value of Object.values(this.internal)) {
      value.createRelatedTree(included);
    }
  }
}
