import { assertEquals } from "@std/assert";
import { calculatePrice } from "../src/bad/price-calculator.ts";
import { PriceCalculator } from "../src/good/price-calculator.ts";
import {
  BigSpenderDiscount,
  BulkDiscount,
  FixedAmountCoupon,
  PercentCoupon,
  TierDiscount,
} from "../src/good/rules/mod.ts";
import { SAMPLE_ORDERS } from "../src/shared/order.ts";

/** Sanity check: the good design reproduces the bad one exactly, so the comparison is fair. */
Deno.test("good design with all v4 rules matches the bad monolith for every sample order", () => {
  const calculator = new PriceCalculator([
    new TierDiscount("premium", 5),
    new TierDiscount("vip", 10),
    new BulkDiscount(10, 3),
    new PercentCoupon("SAVE15", 15),
    new FixedAmountCoupon("WELCOME10", 10),
    new BigSpenderDiscount(500, 5),
  ]);

  for (const order of SAMPLE_ORDERS) {
    assertEquals(calculator.calculate(order), calculatePrice(order), order.id);
  }
});
