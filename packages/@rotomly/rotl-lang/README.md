# rotl-lang

The rotl language is a DSL for describing attacks and abilities of Pokemon cards. It is a lisp + pipes styled syntax in which values are generated and then modified to produce a final result.

This package deals primarily with the language's syntax and not the actual runtime.

## Syntax

Basic s-expr based Lisp, all content is functions.

```lisp
(func)
```

Comments are simply `;;` and are all single line only

```lisp
;; Comment
```

Supports literals like strings, numbers, and booleans. All numbers are 32-bit integers, the Pokemon TCG does _not_ deal in fractions as far as I can tell and thus there is no need to support floating point numbers. `nil` is used to mean undefined or null.

```lisp
(func "enclosed string" 'simple-string 42 true)
```

Enums are prefixed with `@` and are _globally_ available. They are effectively just special strings.

```lisp
(func @example)
```

Properties are prefixed with `:`

```lisp
(func :prop 42)
```

Lists are represented by `[]` and can contain any types including nested lists.

```lisp
(func [42, true, 'value, @example])
```

Dicts are represented by `{}` and can contain any types including nested dicts. All values must be assigned to a property.

```lisp
(func { :a 42 :b true :c 'value :d @example })
```

These are all syntactic sugar over what is actually being created or inferred. All lists & dicts are effectively dicts with either autogenerated numeric indicies or string props.

When _calling_ functions it is entirely possible to mix properties and literals.

```lisp
(func 42 :prop true)
```

The arguments to this function are in essence `{ :0 42 :prop true }` and when writing function definitions the syntax expresses this.

```lisp
(fn func [value] (? $.prop (+ value 1) (- value 1)))
```

The `$` is special syntax for the arguments dict that is presented to _all_ functions - calling `value` in the above example is just shorthand for `$.0`.

To predefine a sequential argument it is simple enough to supply it:

```lisp
(fn func [value = 42] (? $.prop (+ value 1) (- value 1)))
;; `$.prop` will be `nil` and thus false
(func) ;; -> 41
;; `$.prop` is defined
(func :prop true) ;; -> 43
```

To predefine a property in the dict with a default value it's simple enough to just explicitly define it.

```lisp
(fn func [value, :prop = true] (? $.prop (+ value 1) (- value 1)))
;; `$.prop` is defaulted to true
(func 42) ;; -> 43
;; `$.prop` is explicitly set
(func 42 :prop false) ;; -> 41
```

This is a slight mixture of functional syntax and imperative however the pipes also operate in a similar fashion.

It's important to note that because all arguments are dicts then `nil` becomes the default value of anything that cannot be addressed successfully.

## Pipes

There are several pipes that control the stages of output from an attack or ability.

### `+|`

Add the output from the previous stage.

### `-|`

Subtract the output from the previous stage.

### `x|`

Multiply the output from the previous stage. Note that this uses `x` and _not_ `*` as the `x` character is used on the cards typically to denote this functionality.

### `>>`

Apply the previous stages to the given target. Note that there is no vertical pipe character, there can only be one of these per set of instructions.

## Examples

### Targets

It's important to note that in most of the examples below there doesn't appear to be any explicit targetting information while this information is occasionally present on cards themselves. This is because _rotl_ takes the same approach as the card game and _implicitly_ targets the opponent's active Pokemon unless otherwise stated.

Where no targetting information is supplied, the following is added.

```
>> (target @opponent-active)
```

It's very important to note here that targetting information is done via the `>>` operator, which applies all computed damage and conditional output to the targets on the right-hand side.

### Damage Types

By default all calls to `damage` should be considered to have `:type @normal` appended to them as well. Pokemon will need to explicitly define their damage type otherwise. For the sake of simplicity most examples will omit this property.

### Basic Direct Damage

This is a basic direct damage attack.

```
(damage 10)
```

This is the same direct damage but as fire.

```
(damage 10 :type @fire)
```

### Coin Flip

Coin flips are a common damage modifier. Sometimes they control the entire damage output, other times they multiply from a base amount.

Here's some examples - first up is a coin flip that controls whether _any_ damage is applied.

```
(damage 10) x| (coin :target @heads)
```

In this example the base amount is applied regardless as well as additional damage added per successful flip.

```
(damage 10) +| (coin :target @heads :value 10)
```

Again, there are assumptions being made here:

- The first is that there is only _one_ coin.  Several attacks call for multiple coins but the default is a single coin. This is modified by the `:count` property and defaults to `1`.

- The second assumption is that there is only a single flip. Several attacks call for multiple flips but the default is a single flip. This is modified by the `:repeat` property and defaults to `1` as well.

- The third assumption is that there is no clause about stopping at a specific outcome. Several attacks simply specify to flip _until_ a certain outcome is provided. In this instance the property `:repeat_until` can be used to specify that the flip should repeat until either `@heads` or `@tails` is returned. It also accepts a function definition that receives the outcome and the number of flips that have occurred. If this function returns `true` then the coin(s) will stop flipping.
