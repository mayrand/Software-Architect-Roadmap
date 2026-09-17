import { assertEquals } from "@std/assert";
import {
  BigSpenderDiscount,
  BulkDiscount,
  FixedAmountCoupon,
  PercentCoupon,
  TierDiscount,
} from "../src/good/rules/mod.ts";
import type { Order } from "../src/shared/order.ts";

/**
 * Each rule is tested completely on its own. In the bad design every one of these cases would
 * have to run through the tier switch, the bulk check and the coupon chain as well.
 */
const order = (overrides: Partial<Order> = {}): Order => ({
  id: "T-1",
  customer: { name: "Test", tier: "regular" },
  items: [{ sku: "X", unitPrice: 100, quantity: 1 }],
  ...overrides,
});

Deno.test("TierDiscount applies only to its own tier", () => {
  const rule = new TierDiscount("vip", 10);
  assertEquals(rule.discount(order({ customer: { name: "V", tier: "vip" } }), 200), 20);
  assertEquals(rule.discount(order({ customer: { name: "P", tier: "premium" } }), 200), 0);
  assertEquals(rule.name, "VIP tier -10%");
});

Deno.test("BulkDiscount applies at or above the unit threshold", () => {
  const rule = new BulkDiscount(10, 3);
  assertEquals(rule.discount(order({ items: [{ sku: "X", unitPrice: 1, quantity: 10 }] }), 100), 3);
  assertEquals(rule.discount(order({ items: [{ sku: "X", unitPrice: 1, quantity: 9 }] }), 100), 0);
});

Deno.test("PercentCoupon matches the exact code", () => {
  const rule = new PercentCoupon("SAVE15", 15);
  assertEquals(rule.discount(order({ couponCode: "SAVE15" }), 100), 15);
  assertEquals(rule.discount(order({ couponCode: "save15" }), 100), 0);
  assertEquals(rule.discount(order(), 100), 0);
});

Deno.test("FixedAmountCoupon never exceeds the running price", () => {
  const rule = new FixedAmountCoupon("WELCOME10", 10);
  assertEquals(rule.discount(order({ couponCode: "WELCOME10" }), 100), 10);
  assertEquals(rule.discount(order({ couponCode: "WELCOME10" }), 4), 4);
});

Deno.test("BigSpenderDiscount looks at the order subtotal, not the running price", () => {
  const rule = new BigSpenderDiscount(500, 5);
  const big = order({ items: [{ sku: "X", unitPrice: 600, quantity: 1 }] });
  // running price already reduced by earlier rules, but subtotal still qualifies
  assertEquals(rule.discount(big, 400), 20);
  assertEquals(rule.discount(order(), 400), 0);
});
