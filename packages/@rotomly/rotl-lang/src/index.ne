@{%
var ReturnFirst = function(data) {
    return data[0];
}

var fns = {
    "print"(args) {
        console.log(args[0]);
        return null;
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

Program -> (_ Expression _):*

@builtin "whitespace.ne"

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
Function -> [^\s]:+ {% function(data) { return data[0].join("") } %}
Arguments -> (_ Argument):* {% function(data) {
    return data[0].map(function (e) { return e[1]; });
} %}
Argument -> Expression | Symbol | Bool | Integer | Nil | String | Prop

# Literals
Symbol -> "@" [a-zA-Z0-9_\-]:+ [^\-]:? {% function(data) { return data[1].join("") + (data[2] ? data[2] : ""); } %}
True -> "true" {% function() { return true; } %}
False -> "false" {% function() { return false; } %}
Bool -> True | False
Integer -> [0-9]:+ {% function(data) { return parseInt(data[0].join("")); } %}
Nil -> "nil" {% function() { return null; } %}
EnclosedString -> ["] [^"]:* ["] {% function(data) { return data[1].join(""); } %}
SimpleString -> "'" [a-zA-Z0-9_\-]:+ {% function(data) { return data[1].join(""); } %}
String -> EnclosedString | SimpleString
Prop -> ":" [a-zA-Z0-9_\-]:+ [^\-]:? {% function(data) { return data[1].join("") + (data[2] ? data[2] : ""); } %} 