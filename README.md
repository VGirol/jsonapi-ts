# @vgirol/jsonapi-ts

A typed [JSON:API](https://jsonapi.org) client for TypeScript: models, serialization and deserialization, URL
building, and an HTTP client that works over `fetch` or any other HTTP library through an adapter.

> **Status:** `0.x`. The API may still change between minor versions.

- [Installation](#installation)
- [Quick start](#quick-start)
- [Models](#models)
- [Relationships and included resources](#relationships-and-included-resources)
- [Sending resources](#sending-resources)
- [Building URLs](#building-urls)
- [Interceptors](#interceptors)
- [Error handling](#error-handling)
- [Several APIs: dictionaries](#several-apis-dictionaries)
- [Writing an adapter](#writing-an-adapter)

## Installation

```sh
npm install @vgirol/jsonapi-ts
```

The package is ESM only. It runs on Node 22+ and in recent browsers, and has one dependency, `ts-deepmerge`.

## Quick start

Describe each resource type with a model class, register it, then use the client:

```ts
import {
  JsonapiHttpClient,
  JsonapiResource,
  JsonapiResponseError,
  JsonapiUrl,
  isSerializable,
  jsonapiDictionary,
  Serializer
} from "@vgirol/jsonapi-ts";

type PersonAttributes = { name: string };

class Person extends JsonapiResource<PersonAttributes> {}

type ArticleAttributes = { title: string; body: string; publishedOn: Date | null };
type ArticleRelationships = { author: Person; comments: Comment[] };

class Article extends JsonapiResource<ArticleAttributes, ArticleRelationships> {
  cast() {
    return { title: "string", body: "string", publishedOn: "date" };
  }
}

type CommentAttributes = { body: string };

class Comment extends JsonapiResource<CommentAttributes> {}

// The decoded resources of each type are instances of its class
jsonapiDictionary.add("people", Person);
jsonapiDictionary.add("articles", Article);
jsonapiDictionary.add("comments", Comment);

const client = JsonapiHttpClient.make(); // with the fetch adapter

// GET a single resource
const doc = await client.getSingle<Article>("https://api.example.com/articles/1?include=author");
const article = doc.data; // an Article
console.log(article.attribute("title"), article.getSingleRelated("author")?.attribute("name"));

// GET a collection
const list = await client.getCollection<Article>("https://api.example.com/articles");
console.log(list.data.length, list.meta.value("page.total"));

// POST a new resource: the model is serialized for you
const draft = new Article();
draft.fillWith("articles", null, { title: "Hello", body: "First post", publishedOn: null });
const created = await client.post<Article>("https://api.example.com/articles", draft);

// PATCH it
created.data.setAttribute("title", "Hello, world");
await client.patch<Article>(`https://api.example.com/articles/${created.data.id}`, created.data);

// DELETE it
await client.delete(`https://api.example.com/articles/${created.data.id}`);
```

The fetch adapter has no base URL: give absolute URLs, or add one with an [interceptor](#interceptors). To use Axios
instead, see [`@vgirol/jsonapi-axios`](https://github.com/VGirol/jsonapi-axios).

## Models

A model extends `JsonapiResource<Attributes, Relationships>`:

- `id` and `type` are strings. A resource not yet saved has an empty `id`.
- `attribute(name)`, `setAttribute(name, value)` and `setAttributes(values)` read and write the attributes, typed by
  the first type parameter.
- `meta.value("path.to.value")` reads the `meta` member, and `links.all()` the links.

### Casts

`cast()` declares how attributes are converted when a resource is decoded. JSON:API does not define date types, so
these casts are a choice of this library:

| Cast                  | Decoded as                                                         | Sent back as                  |
| --------------------- | ------------------------------------------------------------------ | ----------------------------- |
| `"date"`              | a `Date` at the **local** midnight of the day (`"YYYY-MM-DD"`)     | `"YYYY-MM-DD"`, the local day |
| `"datetime"`          | a `Date` for the instant (RFC 3339, e.g. `"2024-02-29T23:30:00Z"`) | an ISO 8601 string in UTC     |
| `"boolean"`, `"bool"` | `true` or `false`                                                  | the boolean                   |

A calendar day is read in local time so that the day shown never shifts with the time zone of the browser. Any other
cast leaves the value unchanged.

### Temporary resources

A resource is temporary, i.e. not yet saved, when its `id` is empty or is the one returned by `getTempId()`. The id
of a temporary resource is not sent to the server, unless the serializer allows client-generated ids (see
[Sending resources](#sending-resources)).

```ts
const comment = new Comment();
comment.fillWith("comments", null, { body: "Nice!" });
comment.isTempResource(); // true

comment.id = comment.getTempId(); // a v4 UUID, still temporary
```

## Relationships and included resources

When a response has an `included` member, the relationships of the primary data and of the included resources are
linked to the included resources: the decoded document is a tree of models.

```ts
const tree = await client.getSingle<Article>({
  path: "https://api.example.com/articles/1",
  query: { include: ["author", "comments"] }
});

const author = tree.data.getSingleRelated("author"); // Person | null | undefined
const comments = tree.data.getManyRelated("comments"); // Comment[] | undefined
```

- `getSingleRelated(name)` returns the related resource of a to-one relationship (`null` when it is empty).
- `getManyRelated(name)` returns the related resources of a to-many relationship.
- `getRelated(name, id?)` returns either, and `relationship(name)` the relationship itself.
- A relationship whose resources are not in `included` only knows its identifiers: its related resources are
  `undefined` (to-one) or leave out the missing resources (to-many).

To build relationships on the client side, use `setRelated(name, resource)` for a to-one relationship and
`addRelated(name, resources, true)` for a to-many one.

## Sending resources

`post()` and `patch()` accept a model: the adapter serializes it with every attribute and no relationship. To choose
what is sent, serialize it yourself with `Serializer` and send the result:

```ts
const ada = new Person();
ada.fillWith("people", "9", { name: "Ada" });
draft.setRelated("author", ada);

const body = Serializer.source(draft)
  .withOnlyAttributes(["title", "body"]) // only these attributes
  .withRelationships(["author"]) // the author, as a resource identifier
  .toDocument();

await client.post<Article>("https://api.example.com/articles", body);
```

| Method                          | Effect                                                                   |
| ------------------------------- | ------------------------------------------------------------------------ |
| `withOnlyAttributes(names)`     | serializes only these attributes                                         |
| `withoutAttributes()`           | leaves the attributes out, e.g. to send only relationships               |
| `withRelationships(names)`      | serializes these relationships as identifiers; dotted paths go deeper    |
| `withIncluded({ name: [...] })` | adds the related resources to `included` (for a resource only)           |
| `withClientGeneratedId()`       | sends the id of a temporary resource, for servers that accept client ids |

## Building URLs

Every method of the client accepts a URL as a string, or as an object `{ path, query }` whose query is written by
`JsonapiUrl`. `JsonapiUrl` can also be used on its own, e.g. to parse a URL or build a link; pass `url.toString()` to
the client.

```ts
const url = new JsonapiUrl({
  path: "/articles",
  query: {
    include: ["author"],
    fields: [{ name: "articles", value: "title,author" }],
    filter: [{ name: "author.name", value: "Ada" }],
    sort: ["-publishedOn"],
    page: [{ name: "number", value: 2 }]
  }
});

url.toString();
// /articles?include=author&fields[articles]=title,author&filter[author][name]=Ada&sort=-publishedOn&page[number]=2
```

A dotted filter name gives nested brackets. Any other query member is written as `name=value`, an array being joined
with commas. The names and values are URL-encoded, except the commas that separate the items of a list.

## Interceptors

The fetch adapter passes each request through interceptors:

- **request** interceptors receive the options of the request (URL, method, data and `RequestInit`) and return them;
- **response** interceptors receive the decoded response and return it;
- **error** interceptors receive the error and return the error to throw.

They run in the order they were added, after the default ones. Each one has a name, used to remove it, and may run
only `once`:

```ts
import { FetchAdapter } from "@vgirol/jsonapi-ts";

const adapter = new FetchAdapter()
  // A base URL for every request
  .addRequestInterceptor({
    name: "base-url",
    interceptor: (options) => ({ ...options, url: "https://api.example.com" + JsonapiUrl.asString(options.url) })
  })
  // Authentication
  .addRequestInterceptor({
    name: "auth",
    interceptor: (options) => {
      const headers = new Headers(options.clientOptions.headers);
      headers.set("Authorization", `Bearer ${localStorage.getItem("token")}`);
      options.clientOptions.headers = headers;
      return options;
    }
  })
  // Only for the next request
  .addRequestInterceptor({
    name: "trace",
    once: true,
    interceptor: (options) => (console.log(options.method, options.url), options)
  });

const api = JsonapiHttpClient.make(adapter);

adapter.removeRequestInterceptor("auth");
```

The default interceptors are `request-header` (sets `Accept`, and `Content-Type` for a JSON body, unless already
set), `request-jsonapi-version`, `request-encode-data` (serializes the data) and `response-error`. They can be removed
by name too; `resetInterceptors()` removes every interceptor and adds the default ones again.

## Error handling

Every adapter throws the same errors, all extending `JsonapiError`:

| Error                  | When                                               | Carries                                        |
| ---------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `JsonapiResponseError` | the status is outside the 2xx range                | `status`, `document` (if JSON:API), `response` |
| `JsonapiNetworkError`  | no response was received                           | the error of the HTTP client as `cause`        |
| `JsonapiDocumentError` | the document is missing or has an unexpected shape | `document`                                     |

```ts
try {
  await client.post<Article>("https://api.example.com/articles", draft);
} catch (error) {
  if (error instanceof JsonapiResponseError && error.status === 422) {
    for (const item of error.document?.errors.all() ?? []) {
      console.log(item.source.pointer, item.detail); // "/data/attributes/title", "The title is required."
    }
  } else {
    throw error;
  }
}
```

The body of an error response is decoded only when its content type is `application/vnd.api+json`. An aborted request
is thrown as is.

## Several APIs: dictionaries

`jsonapiDictionary` is shared by every client. When two APIs use the same resource type for different models, give
each client its own `Dictionary`:

```ts
import { Dictionary } from "@vgirol/jsonapi-ts";

class Invoice extends JsonapiResource<{ total: number }> {}

const billing = new Dictionary();
billing.add("invoices", Invoice);

const billingClient = JsonapiHttpClient.make(undefined, billing);
```

A type that is not registered is decoded as a plain `JsonapiResource`.

## Writing an adapter

An adapter implements `AdapterContract`: it sends the request and returns the decoded response. It must serialize the
models it receives, decode the body with `Deserializer.decode` and the `dictionary` of the options, and throw the
errors above. A minimal one over `fetch`:

```ts
import {
  AdapterContract,
  AdapterOptions,
  AdapterResponse,
  Deserializer,
  JsonapiNetworkError
} from "@vgirol/jsonapi-ts";

class MinimalAdapter implements AdapterContract {
  async request<R extends JsonapiResource>(options: AdapterOptions): Promise<AdapterResponse<R>> {
    const body = isSerializable(options.data)
      ? JSON.stringify(Serializer.source(options.data).toDocument())
      : undefined;

    let response: Response;
    try {
      response = await fetch(JsonapiUrl.asString(options.url), {
        method: options.method,
        headers: { Accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json" },
        body: body
      });
    } catch (error) {
      throw new JsonapiNetworkError(error);
    }

    const text = await response.text();
    const json = text === "" ? undefined : JSON.parse(text);
    const doc = json === undefined ? undefined : Deserializer.decode<R>(json, options.dictionary);

    if (!response.ok) {
      throw new JsonapiResponseError(response.status, response, doc);
    }

    return { status: response.status, clientResponse: response, json: json, doc: doc };
  }
}

const minimal = JsonapiHttpClient.make(new MinimalAdapter());
```

[`@vgirol/jsonapi-axios`](https://github.com/VGirol/jsonapi-axios) is a complete adapter for Axios.

## License

[MIT](./LICENSE)
