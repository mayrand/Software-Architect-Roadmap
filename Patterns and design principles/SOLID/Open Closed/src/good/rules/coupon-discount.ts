import type { Order } from "../../shared/order.ts";
import type { DiscountRule } from "../discount-rule.ts";

/** Percentage coupon, e.g. SAVE15. */
export class PercentCoupon implements DiscountRule {
  readonly name: string;

  constructor(
    private readonly code: string,
    private readonly percent: number,
  ) {
    this.name = `Coupon ${code} -${percent}%`;
  }

  discount(order: Order, runningPrice: number): number {
    return order.couponCode === this.code ? runningPrice * (this.percent / 100) : 0;
  }
}

/** Fixed-amount coupon, e.g. WELCOME10. Never pushes the price below zero. */
export class FixedAmountCoupon implements DiscountRule {
  readonly name: string;

  constructor(
    private readonly code: string,
    private readonly amount: number,
  ) {
    this.name = `Coupon ${code} -$${amount}`;
  }

  discount(order: Order, runningPrice: number): number {
    return order.couponCode === this.code ? Math.min(this.amount, runningPrice) : 0;
  }
}
