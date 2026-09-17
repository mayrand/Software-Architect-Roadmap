import { type Order, subtotal } from "../../shared/order.ts";
import type { DiscountRule } from "../discount-rule.ts";

/**
 * v4 requirement: "orders over $500 get an extra 5% off".
 *
 * In the bad design this was an edit to a 60-line function. Here it is a NEW FILE.
 * Nothing in price-calculator.ts, and none of the other rules, changed or needed re-testing.
 */
export class BigSpenderDiscount implements DiscountRule {
  readonly name: string;

  constructor(
    private readonly threshold: number,
    private readonly percent: number,
  ) {
    this.name = `Big spender -${percent}%`;
  }

  discount(order: Order, runningPrice: number): number {
    return subtotal(order) > this.threshold ? runningPrice * (this.percent / 100) : 0;
  }
}
