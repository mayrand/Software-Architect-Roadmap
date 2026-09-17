/**
 * SOLID catalog - Open/Closed Principle (OCP)
 *
 * Run:   deno task start
 * Test:  deno task test
 *
 * "Software entities should be open for extension, but closed for modification."
 * Both demos price the same orders so you can compare the *design*, not the output.
 */
import { calculatePrice } from "./src/bad/price-calculator.ts";
import type { DiscountRule } from "./src/good/discount-rule.ts";
import { PriceCalculator } from "./src/good/price-calculator.ts";
import {
  BigSpenderDiscount,
  BulkDiscount,
  FixedAmountCoupon,
  PercentCoupon,
  TierDiscount,
} from "./src/good/rules/mod.ts";
import { printBreakdown, section } from "./src/shared/console-log.ts";
import { SAMPLE_ORDERS } from "./src/shared/order.ts";

function runBadExample(): void {
  section("BAD - one function, one branch per promotion (src/bad/price-calculator.ts)");
  for (const order of SAMPLE_ORDERS) {
    printBreakdown(order, calculatePrice(order));
  }
}

function runGoodExample(): void {
  // Composition root: the ONLY place that decides which promotions are active and in what order.
  const v3Rules: DiscountRule[] = [
    new TierDiscount("premium", 5),
    new TierDiscount("vip", 10),
    new BulkDiscount(10, 3),
    new PercentCoupon("SAVE15", 15),
    new FixedAmountCoupon("WELCOME10", 10),
  ];

  section("GOOD - v3: calculator + registered rules (src/good/*)");
  const v3 = new PriceCalculator(v3Rules);
  for (const order of SAMPLE_ORDERS) {
    printBreakdown(order, v3.calculate(order));
  }

  // A new requirement arrives. We EXTEND by adding one rule; we MODIFY nothing that exists.
  section("GOOD - v4: new requirement 'orders over $500 get 5% off' = one new file, zero edits");
  const v4 = new PriceCalculator([...v3Rules, new BigSpenderDiscount(500, 5)]);
  for (const order of SAMPLE_ORDERS) {
    printBreakdown(order, v4.calculate(order));
  }

  // Even code OUTSIDE src/good can extend the system. A one-off campaign needs no new file at all.
  section("GOOD - bonus: a one-off campaign rule defined right here in main.ts");
  const launchWeek: DiscountRule = {
    name: "Launch week -2%",
    discount: (_order, runningPrice) => runningPrice * 0.02,
  };
  const campaign = new PriceCalculator([...v3Rules, new BigSpenderDiscount(500, 5), launchWeek]);
  printBreakdown(SAMPLE_ORDERS[0], campaign.calculate(SAMPLE_ORDERS[0]));
}

if (import.meta.main) {
  runBadExample();
  runGoodExample();
}
