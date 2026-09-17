import type { Card, Order } from "../../shared/order.ts";

/**
 * GOOD - the PORTS. Abstractions owned by the domain, written in the domain's vocabulary.
 *
 * Nothing in this folder imports from infrastructure or from a vendor SDK
 * (tests/dependency-rule_test.ts enforces that). Infrastructure implements these interfaces;
 * the domain never learns who does.
 */
export type PaymentResult =
  | { readonly approved: true; readonly transactionId: string }
  | { readonly approved: false; readonly reason: string };

export interface PaymentGateway {
  charge(amount: number, card: Card, reference: string): Promise<PaymentResult>;
}

export interface OrderRepository {
  save(order: Order, transactionId: string): Promise<void>;
}

export interface CustomerNotifier {
  orderConfirmed(order: Order, amount: number): Promise<void>;
}
