import { JsonapiResource } from "@/models";
import { ResourceClass, ResourceCtorDictionary } from "@/types";

/**
 * Maps the JSON:API resource types to the classes instantiated when decoding a document.
 * An unknown type is decoded with the default class (`JsonapiResource` unless another one is given).
 *
 * `jsonapiDictionary` is the shared instance, used when no dictionary is given to the client or the deserializer.
 * Give each client its own `Dictionary` when an application talks to several APIs whose types could collide.
 */
export class Dictionary {
  private _dictionary: ResourceCtorDictionary = {};

  /** @param defaultCtor - The class for the types not registered (`JsonapiResource` by default). */
  constructor(private readonly defaultCtor?: ResourceClass<JsonapiResource>) {}

  /**
   * Registers the class to instantiate for a resource type. A later call for the same type replaces it.
   *
   * @param key - The resource type, e.g. `"articles"`.
   * @param value - The model class.
   */
  add<M extends JsonapiResource>(key: string, value: ResourceClass<M>): void {
    this._dictionary[key] = value;
  }

  /** Whether a class is registered for this type. */
  has(type: string): boolean {
    return typeof this._dictionary[type] !== "undefined";
  }

  /** Returns the class registered for a type, or the default class. */
  getResourceCtor<M extends JsonapiResource>(type: string): ResourceClass<M> {
    // The default is read here rather than in the constructor: the shared instance is created while the models load
    return (this._dictionary[type] ?? this.defaultCtor ?? JsonapiResource) as ResourceClass<M>;
  }

  /** Creates an empty instance of the class registered for a type, or of the default class. */
  make<M extends JsonapiResource>(type: string): M {
    const ctor = this.getResourceCtor<M>(type);

    return new ctor();
  }
}

/** The shared dictionary, used by the client, the adapters and the deserializer when no other dictionary is given. */
export const jsonapiDictionary = new Dictionary();
