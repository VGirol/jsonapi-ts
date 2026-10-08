/** The attributes of a resource, by name. Used as the first type parameter of {@link JsonapiResource}. */
export interface AttributesObject {
  /** The value of an attribute. */
  [key: string]: unknown;
}
