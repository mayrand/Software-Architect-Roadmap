import type { Order, PriceBreakdown } from "./order.ts";

/** Tiny helpers so demo output is grouped and easy to read. */
export function section(title: string): void {
  console.log(`\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}`);
}

export function printBreakdown(order: Order, breakdown: PriceBreakdown): void {
  const money = (v: number) => `$${v.toFixed(2).padStart(9)}`;
  console.log(`${order.id}  ${order.customer.name.padEnd(16)} ${order.customer.tier.padEnd(8)}`);
  console.log(`  subtotal ${money(breakdown.subtotal)}`);
  for (const d of breakdown.applied) {
    console.log(`  ${d.name.padEnd(28)} -${money(d.amount)}`);
  }
  console.log(`  TOTAL    ${money(breakdown.total)}`);
}
