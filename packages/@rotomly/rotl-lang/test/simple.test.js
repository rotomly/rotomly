import { Parser, Grammar } from "nearley";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const grammar = require("../dist");
let parser;
const log = (o) => console.log(JSON.stringify(o));

describe("@rotomly/rotl-lang#simple", () => {
  beforeEach(() => {
    parser = new Parser(Grammar.fromCompiled(grammar));
  });
  afterEach(() => {
    parser.finish();
  });
  it("should call a function", () => {
    log(parser.feed("(example 42)").results);
  });
  it("should call a function with two params", () => {
    log(parser.feed("(example 42 21)").results);
  });
  it("should call a function with true", () => {
    log(parser.feed("(example true)").results);
  });
  it("should call a function with false", () => {
    log(parser.feed("(example false)").results);
  });
  it("should call a function with nil", () => {
    log(parser.feed("(example nil)").results);
  });
  it("should call a function with a symbol", () => {
    log(parser.feed("(example @foo)").results);
  });
  it("should call a function with a complex symbol", () => {
    log(parser.feed("(example @foo-42-xxx)").results);
  });
  it("should fail to call a function with an incorrect complex symbol", () => {
    log(parser.feed("(example @foo-42-xxx-)").results)
  });
  it("should call a function with an enclosed string", () => {
    log(parser.feed('(example "foo bar baz")').results);
  });
  it("should call a function with a simplified string", () => {
    log(parser.feed("(example 'simple-string-42)").results);
  });
  it.skip("should call a function with a prop", () => {
    log(parser.feed("(example :prop 42)").results);
  });
  it("should call '?'", () => {
    log(parser.feed("(? nil)").results);
  });
});
