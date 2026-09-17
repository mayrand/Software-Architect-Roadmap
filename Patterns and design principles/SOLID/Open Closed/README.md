# SOLID catalog - Open/Closed Principle

A small Deno app that shows the **same feature built twice**: once violating the Open/Closed
Principle (OCP) and once respecting it. Both variants price the same orders by applying a chain of
discounts, so the output is identical and only the design differs.

> Software entities should be open for extension, but closed for modification. - Bertrand Meyer

"Open for extension" means you can add behavior. "Closed for modification" means you add it by
writing new code, not by editing code that already works and is already tested.

## Run

```bash
deno task start   # run both demos
deno task test    # unit tests for the good design, plus a parity test against the bad one
deno task check   # fmt + lint + type-check
```

## Layout

```
main.ts                            composition root: wires and runs both demos
src/shared/order.ts                domain model + sample orders used by both
src/bad/price-calculator.ts        one function, one switch arm / if branch per promotion
src/good/
  discount-rule.ts                 the extension point (DiscountRule interface)
  price-calculator.ts              closed: applies any list of rules, never changes
  rules/
    tier-discount.ts               v1 premium / vip percentages
    bulk-discount.ts               v2 percentage off for 10+ units
    coupon-discount.ts             v3 PercentCoupon and FixedAmountCoupon
    big-spender-discount.ts        v4 the "new requirement", added as a new file
    mod.ts                         re-exports
tests/
  rules_test.ts                    each rule tested alone
  price-calculator_test.ts         calculator tested with stub rules
  parity_test.ts                   good == bad for every sample order
```

## The bad example

`calculatePrice()` in `src/bad` contains every promotion the business has ever asked for. Its
comments record the history: v1 tier switch, v2 bulk `if`, v3 coupon `else-if` chain, v4 big-spender
`if`. Each version was an edit to the same function.

| A new campaign means...                         | ...and the cost is                                     |
| ----------------------------------------------- | ------------------------------------------------------ |
| Opening a function that already works           | risk of breaking VIP pricing while adding a coupon     |
| Re-running every existing test                  | the whole function is one unit, so nothing is isolated |
| A longer `switch` / `else-if` chain             | the function grows forever and nobody dares touch it   |
| Copy-paste for a shop with a different rule set | the rules cannot be composed differently               |

## The good example

`PriceCalculator` knows _how_ to apply rules and nothing about _what_ they are. Each promotion is a
tiny class implementing `DiscountRule`. `main.ts` shows three stages:

1. **v3**: calculator plus five registered rules.
2. **v4**: the new "orders over $500" requirement is a new file, `big-spender-discount.ts`, added to
   the list. No existing file changed.
3. **Bonus**: a one-off campaign rule written inline in `main.ts`. Even client code can extend the
   system without touching `src/good`.

`tests/parity_test.ts` proves the refactoring is behavior-preserving: with all v4 rules registered,
the good design returns exactly what the bad monolith returns.

## Heuristics for spotting OCP violations

- A `switch` or `if / else if` chain over a type tag, code string, or enum that grows every time the
  business adds a variant.
- Commit history where the same function is touched by every feature ticket.
- You cannot add a variant without also editing the place that consumes the variants.
- Tests for old behavior have to be re-run and sometimes rewritten when new behavior lands.

## Where OCP stops

Do not build extension points for changes that never come. The bad version is fine for a shop with
two fixed discounts. OCP earns its cost once the same axis of change has hit you twice; that is the
moment to introduce the interface. Also note that the _type_ of variation matters: adding a new
customer tier still means editing the `CustomerTier` union in both designs, because the tier list is
data the whole domain shares.
