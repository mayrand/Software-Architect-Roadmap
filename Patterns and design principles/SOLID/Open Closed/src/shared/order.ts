/** Domain model shared by both the good and the bad example. */
export type CustomerTier = "regular" | "premium" | "vip";

export interface Customer {
  readonly name: string;
  readonly tier: CustomerTier;
}

export interface LineItem {
  readonly sku: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

export interface Order {
  readonly id: string;
  readonly customer: Customer;
  readonly items: readonly LineItem[];
  readonly couponCode?: string;
}

export interface AppliedDiscount {
  readonly name: string;
  readonly amount: number;
}

export interface PriceBreakdown {
  readonly subtotal: number;
  readonly total: number;
  readonly applied: readonly AppliedDiscount[];
}

export function subtotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function totalUnits(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Deterministic sample data so both demos produce comparable output. */
export const SAMPLE_ORDERS: readonly Order[] = [
  {
    id: "ORD-1",
    customer: { name: "Ada Lovelace", tier: "regular" },
    items: [
      { sku: "NOTEBOOK", unitPrice: 19.99, quantity: 2 },
      { sku: "PEN", unitPrice: 5.5, quantity: 1 },
    ],
  },
  {
    id: "ORD-2",
    customer: { name: "Grace Hopper", tier: "premium" },
    items: [{ sku: "CABLE", unitPrice: 9.99, quantity: 12 }],
  },
  {
    id: "ORD-3",
    customer: { name: "Linus Torvalds", tier: "vip" },
    items: [
      { sku: "KEYBOARD", unitPrice: 249.0, quantity: 1 },
      { sku: "MOUSE", unitPrice: 79.9, quantity: 1 },
    ],
    couponCode: "SAVE15",
  },
  {
    id: "ORD-4",
    customer: { name: "Barbara Liskov", tier: "regular" },
    items: [
      { sku: "MONITOR", unitPrice: 199.0, quantity: 3 },
      { sku: "STAND", unitPrice: 49.0, quantity: 1 },
    ],
    couponCode: "WELCOME10",
  },
];
