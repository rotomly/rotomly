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
    expect(parser.feed("(example)").results).length(1);
  });
  it("should call a function with one int", () => {
    expect(parser.feed("(example 42)").results).length(1);
  });
  it("should call a function with two ints", () => {
    expect(parser.feed("(example 42 21)").results).length(1);
  });
  it("should call a function with one negative int", () => {
    expect(parser.feed("(example -42)").results).length(1);
  });
  it("should call a function with true", () => {
    expect(parser.feed("(example true)").results).length(1);
  });
  it("should call a function with false", () => {
    expect(parser.feed("(example false)").results).length(1);
  });
  it("should call a function with two bools", () => {
    expect(parser.feed("(example true false)").results).length(1);
  });
  it("should call a function with nil", () => {
    expect(parser.feed("(example nil)").results).length(1);
  });
  it("should call a function with a symbol", () => {
    expect(parser.feed("(example @foo)").results).length(1);
  });
  it("should call a function with a complex symbol", () => {
    expect(parser.feed("(example @base1_1)").results).length(1);
  });
  it("should call a function with a complex symbol using dashes", () => {
    expect(parser.feed("(example @base1-1)").results).length(1);
  });
  it("should fail to call a function with an incorrect complex symbol", () => {
    //expect(() => parser.feed("(example @foo-42-xxx-)").results).throws();
    log(parser.feed("(example @foo-)").results);
  });
  it("should call a function with an enclosed string", () => {
    expect(parser.feed('(example "foo bar baz")').results).length(1);
  });
  it("should call a function with an enclosed string and numbers", () => {
    expect(parser.feed('(example "foo bar baz 42")').results).length(1);
  });
  it.skip("should call a function with an enclosed string and escaped chars", () => {
    expect(parser.feed('(example "foo bar baz \\" 42")').results).length(1);
  });
  it("should call a function with a simplified string", () => {
    expect(parser.feed("(example 'simple)").results).length(1);
  });
  it("should call a function with a complex simplified string", () => {
    expect(parser.feed("(example 'simple-string)").results).length(1);
  });
  it("should call a function with a complex simplified string with numbers", () => {
    expect(parser.feed("(example 'base1-1)").results).length(1);
  });
  it.skip("should call a function with a prop", () => {
    log(parser.feed("(example :prop true)").results);
  });
  it("should call '?'", () => {
    log(parser.feed("(? nil)").results);
  });
});
