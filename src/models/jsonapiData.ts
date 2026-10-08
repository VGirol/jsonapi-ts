import { JsonapiDataType } from "@/types";
import { JsonapiResource } from "./jsonapiResource";

/** The primary data of a document. */
export class JsonapiData<M extends JsonapiResource = JsonapiResource> {
  private internal?: JsonapiDataType<M>;

  /** Whether the document has no `data` member (`null` is not empty: it is an empty to-one value). */
  isEmpty(): boolean {
    return this.internal === undefined;
  }

  /** Returns the primary data. */
  get(): JsonapiDataType<M> {
    return this.internal;
  }

  /** Sets the primary data. */
  set(value: JsonapiDataType<M>): void {
    this.internal = value;
  }

  /**
   * Returns the primary data, when it is a single resource.
   *
   * @throws Error when the primary data is not a single resource.
   */
  getAsResource(): M {
    if (!(this.internal instanceof JsonapiResource)) {
      throw new Error("Data member is not a single resource.");
    }

    return this.internal;
  }

  /** Links the relationships of the primary resources to the included resources. */
  createResourceTree(included: JsonapiResource[]): void {
    if (this.internal === undefined || this.internal === null) {
      return;
    }

    if (Array.isArray(this.internal)) {
      this.internal.forEach((item) => item.createRelatedTree(included));

      return;
    }

    this.internal.createRelatedTree(included);
  }
}
