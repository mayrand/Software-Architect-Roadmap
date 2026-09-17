import type { Order } from "../shared/order.ts";

/**
 * GOOD - the extension point.
 *
 * Every promotion is an implementation of this interface. The calculator depends only on this
 * abstraction, so new promotions can be added forever without touching the calculator.
 */
export interface DiscountRule {
  /** Human-readable label that appears on the receipt. */
  readonly name: string;

  /**
   * Returns the amount to subtract from `runningPrice`, or 0 when the rule does not apply.
   * Rules are applied in the order they are registered, each seeing the price left by the
   * previous one.
   */
  discount(order: Order, runningPrice: number): number;
}
