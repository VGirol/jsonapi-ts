import { JsonapiDocument, JsonapiResource } from "@/models";
import { MetaDto } from "../dto";

/** A document whose primary data is a single resource, as returned by `JsonapiHttpClient.getSingle()`. */
export type JsonapiDocumentSingle<R extends JsonapiResource = JsonapiResource, M extends MetaDto = MetaDto> = Omit<
  JsonapiDocument<R, M>,
  "data"
> & {
  /** The primary resource. */
  data: R;
};

/** A document whose primary data is an array of resources, as returned by `JsonapiHttpClient.getCollection()`. */
export type JsonapiDocumentCollection<R extends JsonapiResource = JsonapiResource, M extends MetaDto = MetaDto> = Omit<
  JsonapiDocument<R, M>,
  "data"
> & {
  /** The primary resources. */
  data: R[];
};
