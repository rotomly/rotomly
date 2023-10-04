#@preprocessor typescript

@{%
const moo = require("moo");
const lexer = moo.compile({
    ws: /[\s]+/,
    comment: {
        match: /;[^\n]*/,
        value: s => s.substring(1)
    },
    identifier: {
        match: /[a-zA-Z_\d\-]+/,
        type: moo.keywords({
            fn: "fn",
            true: "true",
            false: "false",
            nil: "nil"
        })
    },
    symbol: {
        match: /@([a-zA-Z][a-zA-Z\d_-]*(?<![_-]))/
        value: s => s.substring(1)
    }
    string_literal: {
        match: /"/:
    },
    int_literal: {
        match: /-?[0-9]+/,
        value: s => parseInt(s)
    }
});

var fns = {
    "print"(args) {
        console.log(args[0]);
        return null;
    },
    // TODO: Formatting strings by manual replacement
    "fmt"(args) {
        return args[0];
    },
    "?"(args) {
        return typeof args[0] !== "undefined" && args[0] !== null;
    },
    "="(args) {
        return args[0] === args[1];
    },
    "+"(args) {
        return args[0] + args[1];
    },
    "-"(args) {
        return args[0] - args[1];
    },
    "*"(args) {
        return args[0] * args[1];
    }
}

%}

@lexer lexer

@builtin "whitespace.ne"
@builtin "number.ne"

Program -> (_ Expression _):*

Expression -> "(" _ Function (__ Arguments):? _ ")" {%
    function (data) {
        var name = data[2];
        var args = data[3] ? data[3][1].map(function (arg) { return arg[0] }) : [];
        console.log("Calling", name, "with", JSON.stringify(args));
        if (fns.hasOwnProperty(name)) {
            console.log("Found a function", name);
            return fns[name](args);
        }
    }
%}

# Functions
Function -> [^\s]:+ {% d => d.flat().join("") %}
Arguments -> (_ Argument):* {% function(data) {
    return data[0].map(function (e) { return e[1]; });
} %}
Argument -> Expression | Symbol | Bool |  Nil | String | Prop | int

# Literals
Symbol -> "@" [a-zA-Z0-9_\-]:+ [^\-] {% d => d.flat().join("").slice(1) %}
Bool -> "true" {% () => true %} | "false" {% () => false %}
Nil -> "nil" {% () => null %}
String -> ["] [^"]:* ["] {% d => d[1].join("") %} | "'" [^\s\)]:+ {% d => d[1].join("") %}
Prop -> ":" [a-zA-Z0-9_\-]:+ [^\-]:? {% function(data) { return data[1].join("") + (data[2] ? data[2] : ""); } %} 

# Integer -> [\-]:? [0-9]:+ {% d => parseInt(d.flat().join("")) %}