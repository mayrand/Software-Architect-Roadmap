import {
  type AppliedDiscount,
  type Order,
  type PriceBreakdown,
  roundMoney,
  subtotal,
} from "../shared/order.ts";
import type { DiscountRule } from "./discount-rule.ts";

/**
 * GOOD - closed for modification.
 *
 * This class was finished the day it was written. It knows HOW to apply a list of rules and
 * nothing about WHAT the rules are. Adding a promotion never requires editing this file, so the
 * tests that cover it never need to change either.
 */
export class PriceCalculator {
  constructor(private readonly rules: readonly DiscountRule[]) {}

  calculate(order: Order): PriceBreakdown {
    const base = subtotal(order);
    let price = base;
    const applied: AppliedDiscount[] = [];

    for (const rule of this.rules) {
      const amount = rule.discount(order, price);
      if (amount > 0) {
        price -= amount;
        applied.push({ name: rule.name, amount: roundMoney(amount) });
      }
    }

    return { subtotal: roundMoney(base), total: roundMoney(Math.max(price, 0)), applied };
  }
}
