import { type Order, orderTotal } from "../../shared/order.ts";
import type { CustomerNotifier, OrderRepository, PaymentGateway } from "./ports.ts";

export type PlaceOrderResult =
  | { readonly status: "placed"; readonly transactionId: string }
  | { readonly status: "declined"; readonly reason: string };

/**
 * GOOD - the POLICY. It depends only on the ports above, which it owns.
 *
 * Compare with src/bad/order-service.ts: same steps, same rule, but not a single vendor type,
 * connection string or API key. It can be tested in microseconds with three stub objects, and
 * swapping Stripe for another provider is a change in infrastructure plus one line in main.ts.
 */
export class PlaceOrderUseCase {
  constructor(
    private readonly payments: PaymentGateway,
    private readonly orders: OrderRepository,
    private readonly notifier: CustomerNotifier,
  ) {}

  async execute(order: Order): Promise<PlaceOrderResult> {
    const amount = orderTotal(order);

    const payment = await this.payments.charge(amount, order.card, order.id);
    if (!payment.approved) {
      return { status: "declined", reason: payment.reason };
    }

    await this.orders.save(order, payment.transactionId);
    await this.notifier.orderConfirmed(order, amount);

    return { status: "placed", transactionId: payment.transactionId };
  }
}
