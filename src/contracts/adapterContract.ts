import { JsonapiResource } from "@/models";
import { AdapterOptions } from "./adapterOptions";
import { AdapterResponse } from "./adapterResponse";

/**
 * What {@link JsonapiHttpClient} needs from an adapter: send a request and return the decoded response.
 *
 * An adapter must:
 *
 * - serialize the models given as `data` (see {@link isSerializable} and {@link Serializer});
 * - decode the body of the response with {@link Deserializer.decode} and the `dictionary` of the options;
 * - reject with a {@link JsonapiResponseError} for a status outside the 2xx range, and with a
 *   {@link JsonapiNetworkError} when no response is received.
 */
export interface AdapterContract {
  /** Sends a request and returns the decoded response. */
  request: <R extends JsonapiResource>(options: AdapterOptions) => Promise<AdapterResponse<R>>;
}
