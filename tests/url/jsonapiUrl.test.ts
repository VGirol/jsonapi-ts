import { describe, it, expect } from "vitest";
import { JsonapiUrl } from "../internals";

describe("JsonapiUrl", () => {
  it("writes the query of the documented example", () => {
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

    expect(url.toString()).toBe(
      "/articles?include=author&fields[articles]=title,author&filter[author][name]=Ada&sort=-publishedOn&page[number]=2"
    );
  });

  it("parses a URL string", () => {
    const url = new JsonapiUrl("/articles?include=author,comments&page[size]=10");

    expect(url.path).toBe("/articles");
    expect(url.query.get("include")).toEqual(["author", "comments"]);
    expect(url.query.get("page")).toEqual([{ name: "size", value: "10" }]);
  });

  it("writes a path without query as is", () => {
    expect(JsonapiUrl.asString({ path: "/articles" })).toBe("/articles");
  });

  it("URL-encodes the names and values, keeping the commas", () => {
    const url = new JsonapiUrl({
      path: "/articles",
      query: {
        filter: [
          { name: "title", value: "Tom & Jerry #1 = 100%" },
          { name: "author.name", value: "Zoé Ünal" }
        ],
        fields: [{ name: "articles", value: "title,body" }],
        sort: ["-published on"]
      }
    });

    expect(url.toString()).toBe(
      "/articles?filter[title]=Tom%20%26%20Jerry%20%231%20%3D%20100%25&filter[author][name]=Zo%C3%A9%20%C3%9Cnal" +
        "&fields[articles]=title,body&sort=-published%20on"
    );
  });

  it("decodes the names and values of a parsed URL", () => {
    const url = new JsonapiUrl("/articles?filter%5Btitle%5D=Tom%20%26%20Jerry&sort=-title,name");

    expect(url.query.get("filter")).toEqual([{ name: "title", value: "Tom & Jerry" }]);
    expect(url.query.get("sort")).toEqual(["-title", "name"]);
  });

  it("gives back the same URL after parsing it", () => {
    const source = "/articles?filter[title]=Tom%20%26%20Jerry&page[number]=2&include=author,comments";

    expect(JsonapiUrl.asString(source)).toBe(source);
  });

  it("keeps a value that contains '=' once decoded", () => {
    expect(new JsonapiUrl("/a?filter[q]=a%3Db").query.get("filter")).toEqual([{ name: "q", value: "a=b" }]);
    expect(new JsonapiUrl("/a?filter[q]=a=b").query.get("filter")).toEqual([{ name: "q", value: "a=b" }]);
  });

  it("keeps a malformed escape sequence as is", () => {
    expect(new JsonapiUrl("/a?filter[q]=100%").query.get("filter")).toEqual([{ name: "q", value: "100%" }]);
  });

  it("ignores empty parameters and accepts a parameter without value", () => {
    const url = new JsonapiUrl("/a?&include=author&&flag");

    expect(url.query.get("include")).toEqual(["author"]);
    expect(url.query.get("flag")).toEqual([""]);
  });
});
