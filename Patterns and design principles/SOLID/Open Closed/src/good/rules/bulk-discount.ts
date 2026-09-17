import { type Order, totalUnits } from "../../shared/order.ts";
import type { DiscountRule } from "../discount-rule.ts";

export class BulkDiscount implements DiscountRule {
  readonly name: string;

  constructor(
    private readonly minUnits: number,
    private readonly percent: number,
  ) {
    this.name = `Bulk order -${percent}%`;
  }

  discount(order: Order, runningPrice: number): number {
    return totalUnits(order) >= this.minUnits ? runningPrice * (this.percent / 100) : 0;
  }
}
