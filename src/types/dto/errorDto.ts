import { LinksDto } from "./linksDto";
import { MetaDto } from "./metaDto";

/** The raw `source` member of an error object. */
export interface SourceDto {
  /** A JSON Pointer to the value of the request document that caused the error. */
  pointer: string;
  /** The query parameter that caused the error. */
  parameter: string;
}

/** The raw JSON shape of an error object. */
export interface ErrorDto {
  /** A unique identifier for this occurrence of the problem. */
  id?: string;
  /** The error links (`about`, `type`). */
  links?: LinksDto;
  /** The HTTP status code, as a string. */
  status?: string;
  /** An application-specific error code. */
  code?: string;
  /** A short summary of the problem. */
  title?: string;
  /** An explanation of this occurrence of the problem. */
  detail?: string;
  /** What caused the error in the request. */
  source?: SourceDto;
  /** The error meta. */
  meta?: MetaDto;
}
