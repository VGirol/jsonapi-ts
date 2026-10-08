import { MetaDto } from "./metaDto";

/** A raw `links` member: links by name. */
export declare type LinksDto = Record<string, LinkDto>;
/** A raw link: a URL, a link object, or `null`. */
export declare type LinkDto = string | { href?: string; meta?: MetaDto } | null;
