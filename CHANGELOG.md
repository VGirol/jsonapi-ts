# Changelog

All notable changes to this package are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package uses
[semantic versioning](https://semver.org/). While the version is `0.x`, a breaking change bumps the minor version.

## [0.1.0] - Unreleased

First public release.

### Added

- Typed models for JSON:API documents: `JsonapiDocument`, `JsonapiResource` (attributes, relationships, casts),
  `JsonapiRelationship`, meta, links, errors.
- `Serializer` and `Deserializer` facades, with the reconstruction of the resource tree from `included`.
- `Dictionary` mapping resource types to model classes. A client can use its own dictionary instead of the shared
  `jsonapiDictionary`.
- `JsonapiUrl` to build and parse URLs with `include`, `fields`, `filter`, `sort` and `page`. The query names and
  values are URL-encoded.
- `JsonapiHttpClient` with `get`, `getSingle`, `getCollection`, `post`, `patch` and `delete`, over a pluggable
  adapter (`AdapterContract`).
- `FetchAdapter`, the default adapter, with request, response and error interceptors.
- Error classes shared by every adapter: `JsonapiError`, `JsonapiResponseError` (status, decoded document and client
  response), `JsonapiDocumentError` and `JsonapiNetworkError`.
