// Public API of the package. Every export is listed by name, so that nothing becomes public by accident:
// a type that appears in the signature of a public element must be exported here (checked by api-extractor).

// Client
export { JsonapiHttpClient } from "./client";

// Adapter contract
export type { AdapterContract, AdapterOptions, AdapterResponse } from "./contracts";

// Fetch adapter
export { FetchAdapter } from "./fetch-adapter";
export type {
  ErrorInterceptor,
  FetchAdapterOptions,
  FetchAdapterOptionsWithInit,
  FetchAdapterResponse,
  InterceptorType,
  NamedErrorInterceptor,
  NamedRequestInterceptor,
  NamedResponseInterceptor,
  RequestInterceptor,
  ResponseInterceptor
} from "./fetch-adapter";

// Errors
export { JsonapiDocumentError, JsonapiError, JsonapiNetworkError, JsonapiResponseError } from "./errors";

// Models
export {
  JsonapiData,
  JsonapiDocument,
  JsonapiErrorObject,
  JsonapiErrors,
  JsonapiErrorSource,
  JsonapiJsonapi,
  JsonapiLink,
  JsonapiLinks,
  JsonapiMeta,
  JsonapiRelationship,
  JsonapiRelationships,
  JsonapiResource
} from "./models";

// Resource factory and dictionary
export { Dictionary, jsonapiDictionary, ResourceFactory } from "./services";

// Serialization and deserialization
export { Deserializer } from "./deserializers";
export { Serializer } from "./serializers";
// Returned by Serializer.source(). Exported as a value: the rolled-up declarations do not keep "export type".
export { AbstractSerializer } from "./serializers/abstractSerializer";

// URL
export { JsonapiUrl, JsonapiUrlQuery } from "./url";
export type { UrlOptions, UrlQueryItem, UrlQueryOptions, UrlType } from "./types";

// Guards
export {
  isDocumentWithManyResources,
  isDocumentWithSingleResource,
  isSerializable,
  isValidResource,
  isValidSingleResource
} from "./guards";

// Model types
export type {
  AttributesObject,
  ExtractAttributeType,
  ExtractRelationshipsType,
  JsonapiDataType,
  JsonapiDocumentCollection,
  JsonapiDocumentSingle,
  JsonapiRelationshipDataType,
  RelationshipsDef,
  ResourceClass
} from "./types";

// DTO: the raw JSON shape of a document
export type {
  DocumentDto,
  DtoDataType,
  ErrorDto,
  JsonapiDto,
  LinkDto,
  LinksDto,
  MetaDto,
  RelationshipDto,
  RelationshipsDto,
  ResourceDto,
  ResourceIdentifierDto,
  SourceDto
} from "./types";

// Parameters of the serialization facade
export type { RawRequestedIncluded, RawRequestedRelationships, RequestedRelationships, SourceType } from "./types";
