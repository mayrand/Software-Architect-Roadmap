import type { CustomerTier, Order } from "../../shared/order.ts";
import type { DiscountRule } from "../discount-rule.ts";

const TIER_LABELS: Record<CustomerTier, string> = {
  regular: "Regular",
  premium: "Premium",
  vip: "VIP",
};

/** GOOD - open for extension: one small class per promotion. */
export class TierDiscount implements DiscountRule {
  readonly name: string;

  constructor(
    private readonly tier: CustomerTier,
    private readonly percent: number,
  ) {
    this.name = `${TIER_LABELS[tier]} tier -${percent}%`;
  }

  discount(order: Order, runningPrice: number): number {
    return order.customer.tier === this.tier ? runningPrice * (this.percent / 100) : 0;
  }
}
