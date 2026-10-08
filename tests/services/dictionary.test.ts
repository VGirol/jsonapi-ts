import { describe, it, expect } from "vitest";
import { Deserializer, Dictionary, jsonapiDictionary, JsonapiResource, ResourceFactory } from "../internals";

class Article extends JsonapiResource<{ title: string }> {}
class Post extends JsonapiResource<{ title: string }> {}
class Fallback extends JsonapiResource {}

describe("Dictionary", () => {
  it("instantiates the class registered for a type", () => {
    const dictionary = new Dictionary();
    dictionary.add("articles", Article);

    expect(dictionary.has("articles")).toBe(true);
    expect(dictionary.make("articles")).toBeInstanceOf(Article);
  });

  it("falls back to JsonapiResource for an unknown type, without any registration", () => {
    const dictionary = new Dictionary();

    expect(dictionary.has("unknown")).toBe(false);
    expect(dictionary.make("unknown").constructor).toBe(JsonapiResource);
  });

  it("falls back to the default class it was given", () => {
    expect(new Dictionary(Fallback).make("unknown")).toBeInstanceOf(Fallback);
  });

  it("keeps the registrations of each dictionary apart", () => {
    const first = new Dictionary();
    const second = new Dictionary();
    first.add("articles", Article);
    second.add("articles", Post);

    expect(first.make("articles")).toBeInstanceOf(Article);
    expect(second.make("articles")).toBeInstanceOf(Post);
    expect(jsonapiDictionary.has("articles")).toBe(false);
  });
});

describe("decoding with a dictionary", () => {
  const dto = {
    data: {
      type: "articles",
      id: "1",
      attributes: { title: "Hello" },
      relationships: { related: { data: { type: "articles", id: "2" } } }
    },
    included: [{ type: "articles", id: "2", attributes: { title: "World" } }]
  };

  it("instantiates the data and the included resources from the given dictionary", () => {
    const dictionary = new Dictionary();
    dictionary.add("articles", Article);

    const doc = Deserializer.decode(dto, dictionary);

    expect(doc.dataAsResource).toBeInstanceOf(Article);
    expect(doc.included[0]).toBeInstanceOf(Article);
    expect(doc.dataAsResource.getRelated("related")).toBeInstanceOf(Article);
  });

  it("uses the shared dictionary by default", () => {
    const doc = Deserializer.decode(dto);

    expect(doc.dataAsResource.constructor).toBe(JsonapiResource);
  });

  it("lets ResourceFactory use the given dictionary", () => {
    const dictionary = new Dictionary();
    dictionary.add("articles", Article);

    const article = ResourceFactory.from<Article>("articles", null, { title: "New" }, dictionary);

    expect(article).toBeInstanceOf(Article);
    expect(article.attribute("title")).toBe("New");
  });
});
