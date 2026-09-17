import { assertEquals } from "@std/assert";
import type { DiscountRule } from "../src/good/discount-rule.ts";
import { PriceCalculator } from "../src/good/price-calculator.ts";
import type { Order } from "../src/shared/order.ts";

const order: Order = {
  id: "T-1",
  customer: { name: "Test", tier: "regular" },
  items: [{ sku: "X", unitPrice: 100, quantity: 1 }],
};

/** A rule that always takes a fixed amount; lets us test the calculator with no real promotions. */
const flat = (name: string, amount: number): DiscountRule => ({
  name,
  discount: () => amount,
});

Deno.test("no rules means total equals subtotal", () => {
  const result = new PriceCalculator([]).calculate(order);
  assertEquals(result, { subtotal: 100, total: 100, applied: [] });
});

Deno.test("rules are applied in registration order, each seeing the running price", () => {
  const seen: number[] = [];
  const spy: DiscountRule = {
    name: "spy",
    discount: (_o, running) => {
      seen.push(running);
      return running / 2;
    },
  };
  const result = new PriceCalculator([spy, spy]).calculate(order);
  assertEquals(seen, [100, 50]);
  assertEquals(result.total, 25);
});

Deno.test("rules that return 0 are not listed on the receipt", () => {
  const result = new PriceCalculator([flat("skip", 0), flat("take", 5)]).calculate(order);
  assertEquals(result.applied, [{ name: "take", amount: 5 }]);
});

Deno.test("total never drops below zero", () => {
  const result = new PriceCalculator([flat("huge", 1000)]).calculate(order);
  assertEquals(result.total, 0);
});

Deno.test("the calculator is extended by adding a rule, not by editing the calculator", () => {
  const before = new PriceCalculator([flat("a", 10)]).calculate(order).total;
  const after = new PriceCalculator([flat("a", 10), flat("b", 10)]).calculate(order).total;
  assertEquals(before, 90);
  assertEquals(after, 80);
});
