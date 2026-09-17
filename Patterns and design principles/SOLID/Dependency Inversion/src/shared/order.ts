/** Domain model shared by both the good and the bad example. */
export interface OrderLine {
  readonly sku: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

export interface Card {
  readonly number: string;
  readonly holder: string;
}

export interface Order {
  readonly id: string;
  readonly customerEmail: string;
  readonly lines: readonly OrderLine[];
  readonly card: Card;
}

export function orderTotal(order: Order): number {
  const total = order.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  return Math.round(total * 100) / 100;
}

/** Deterministic sample data: the second card is declined by the fake payment provider. */
export const SAMPLE_ORDERS: readonly Order[] = [
  {
    id: "ORD-1",
    customerEmail: "ada@example.com",
    lines: [{ sku: "KEYBOARD", unitPrice: 249.0, quantity: 1 }],
    card: { number: "4242424242424242", holder: "Ada Lovelace" },
  },
  {
    id: "ORD-2",
    customerEmail: "grace@example.com",
    lines: [{ sku: "MONITOR", unitPrice: 199.0, quantity: 2 }],
    card: { number: "4000000000000000", holder: "Grace Hopper" },
  },
];
