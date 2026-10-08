import { JsonapiData, JsonapiResource } from "../models";
import { DtoDataType, ExtractAttributeType } from "../types";
import { ResourceDeserializer } from "./resourceDeserializer";
import { Dictionary, jsonapiDictionary } from "../services";

export class DataDeserializer {
  static decodeData<M extends JsonapiResource = JsonapiResource>(
    data: JsonapiData<M>,
    source: DtoDataType<ExtractAttributeType<M>>,
    dictionary: Dictionary = jsonapiDictionary
  ): void {
    data.set(
      source === null
        ? null
        : Array.isArray(source)
          ? source.map((item) => ResourceDeserializer.decodeResource<M>(item, dictionary))
          : ResourceDeserializer.decodeResource<M>(source, dictionary)
    );
  }
}
