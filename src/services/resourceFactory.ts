import { JsonapiDocument, JsonapiRelationship, JsonapiResource } from "@/models";
import { Dictionary, jsonapiDictionary } from "./dictionary";
import { Deserializer } from "@/deserializers";
import { Serializer } from "@/serializers";
import { ExtractAttributeType } from "@/types";
import { isSerializable } from "@/guards";

/** Creates resources with the class registered for their type. */
export class ResourceFactory {
  /**
   * Creates an empty resource of the class registered for a type.
   *
   * @param type - The resource type.
   * @param dictionary - The dictionary to use (the shared `jsonapiDictionary` by default).
   */
  static getModelInstance<M extends JsonapiResource>(type: string, dictionary: Dictionary = jsonapiDictionary): M {
    return dictionary.make<M>(type);
  }

  /**
   * Creates a resource of the class registered for a type, with an id and some attributes.
   *
   * @param type - The resource type.
   * @param id - The resource id; `null` for a new resource.
   * @param data - The attributes to set, as is (no cast).
   * @param dictionary - The dictionary to use (the shared `jsonapiDictionary` by default).
   */
  static from<M extends JsonapiResource>(
    type: string,
    id: string | null,
    data?: Partial<ExtractAttributeType<M>>,
    dictionary: Dictionary = jsonapiDictionary
  ): M {
    const obj = this.getModelInstance<M>(type, dictionary);

    obj.fillWith(type, id, data);

    return obj;
  }

  /**
   * Serializes a resource or a relationship, then decodes the result: a detached copy as a document.
   *
   * @param source - The resource or relationship.
   * @param relationships - The relationships to keep (dotted paths allowed).
   * @param dictionary - The dictionary used to decode the copy (the shared `jsonapiDictionary` by default).
   * @throws Error when the source is neither a resource nor a relationship.
   */
  static toDocument<M extends JsonapiResource>(
    source: M | JsonapiRelationship<M>,
    relationships?: string[],
    dictionary: Dictionary = jsonapiDictionary
  ): JsonapiDocument<M> {
    if (!isSerializable<M>(source)) {
      throw new Error("Source must be JsonapiResource or JsonapiRelationship instance.");
    }

    return Deserializer.decode(
      Serializer.source<M>(source)
        .withRelationships(relationships ?? [])
        .toDocument(),
      dictionary
    );
  }
}
