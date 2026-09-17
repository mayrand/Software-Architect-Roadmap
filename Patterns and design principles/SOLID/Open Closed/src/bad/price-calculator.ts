import {
  type AppliedDiscount,
  type Order,
  type PriceBreakdown,
  roundMoney,
  subtotal,
  totalUnits,
} from "../shared/order.ts";

/**
 * BAD: Open/Closed Principle violated.
 *
 * Every pricing rule the business has ever asked for lives inside this one function as a
 * `switch` arm or an `if` branch. The function is "open for modification": the ONLY way to add
 * a promotion is to open it up, edit working code, and re-test every existing path.
 *
 * Look at the change history encoded in the comments below. Each requirement forced an edit
 * to code that already worked:
 *
 *   v1  tier discounts             (initial release)
 *   v2  bulk discount              (edited this function)
 *   v3  coupon codes               (edited this function, added an else-if chain)
 *   v4  big-spender discount       (edited this function again)
 *
 * Symptoms this causes:
 *   - Risk: a typo in the new branch can break the VIP discount that has worked for a year.
 *   - Testing: you cannot test the coupon logic without also exercising tier and bulk logic.
 *   - Reuse: a second shop that wants only tier + coupon has to copy-paste and delete.
 *   - Growth: the function gets longer with every campaign and nobody dares to touch it.
 */
export function calculatePrice(order: Order): PriceBreakdown {
  const base = subtotal(order);
  let price = base;
  const applied: AppliedDiscount[] = [];

  // --- v1: tier discounts. A new tier means a new case here AND in the CustomerTier union.
  switch (order.customer.tier) {
    case "regular":
      break;
    case "premium": {
      const amount = price * 0.05;
      price -= amount;
      applied.push({ name: "Premium tier -5%", amount: roundMoney(amount) });
      break;
    }
    case "vip": {
      const amount = price * 0.10;
      price -= amount;
      applied.push({ name: "VIP tier -10%", amount: roundMoney(amount) });
      break;
    }
  }

  // --- v2: bulk discount. Bolted on below the switch; order of application is now implicit.
  if (totalUnits(order) >= 10) {
    const amount = price * 0.03;
    price -= amount;
    applied.push({ name: "Bulk order -3%", amount: roundMoney(amount) });
  }

  // --- v3: coupon codes. Marketing adds a new code every month; each one is a new else-if.
  if (order.couponCode === "SAVE15") {
    const amount = price * 0.15;
    price -= amount;
    applied.push({ name: "Coupon SAVE15 -15%", amount: roundMoney(amount) });
  } else if (order.couponCode === "WELCOME10") {
    const amount = Math.min(10, price);
    price -= amount;
    applied.push({ name: "Coupon WELCOME10 -$10", amount: roundMoney(amount) });
  }
  // else if (order.couponCode === "SPRING20") { ... }   <- next month, guaranteed

  // --- v4: big-spender discount. Yet another edit to a function that already worked.
  if (base > 500) {
    const amount = price * 0.05;
    price -= amount;
    applied.push({ name: "Big spender -5%", amount: roundMoney(amount) });
  }

  return { subtotal: roundMoney(base), total: roundMoney(Math.max(price, 0)), applied };
}
