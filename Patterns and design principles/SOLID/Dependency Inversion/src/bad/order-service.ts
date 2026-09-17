import { type Order, orderTotal } from "../shared/order.ts";
// The arrows point the WRONG way: business policy imports vendor SDKs.
import { PostgresClient } from "../shared/vendors/postgres.ts";
import { SmtpTransport } from "../shared/vendors/smtp.ts";
import { type StripeChargeResponse, StripeClient } from "../shared/vendors/stripe.ts";

/**
 * BAD: Dependency Inversion Principle violated.
 *
 * `PlaceOrderService` is the most important business rule in the shop, and it depends directly
 * on three of the most volatile, least important details: a database driver, a payment SDK and
 * a mail transport. High-level policy -> low-level detail.
 *
 * Consequences:
 *   - It cannot be tested without those vendors. tests/bad-order-service_test.ts pays 300 ms of
 *     fake network latency and prints vendor logs, just to check an if-statement.
 *   - Vendor vocabulary leaks into the policy: amount_cents, failure_message, status codes.
 *   - Replacing Stripe with another provider means editing the business rule itself.
 *   - Connection strings and API keys are baked into the policy class.
 *   - Every module that imports this class transitively depends on all three SDKs.
 */
export class PlaceOrderService {
  private readonly db = new PostgresClient("prod-db");
  private readonly stripe = new StripeClient("sk_live_7f3a");
  private readonly smtp = new SmtpTransport("smtp.prod.internal");

  async placeOrder(order: Order): Promise<string> {
    const totalCents = Math.round(orderTotal(order) * 100);

    const charge: StripeChargeResponse = await this.stripe.createCharge({
      amount_cents: totalCents,
      currency: "usd",
      source: { number: order.card.number, name: order.card.holder },
      description: `Order ${order.id}`,
    });
    if (charge.status !== "succeeded") {
      return `declined: ${charge.failure_message}`; // Stripe's words, in our business rule
    }

    await this.db.query(
      "INSERT INTO orders (id, email, total_cents, stripe_charge_id) VALUES ($1, $2, $3, $4)",
      [order.id, order.customerEmail, totalCents, charge.id],
    );

    await this.smtp.sendMail({
      from: "shop@example.com",
      to: order.customerEmail,
      subject: `Order ${order.id} confirmed`,
      body: `Thanks! We charged ${(totalCents / 100).toFixed(2)} USD.`,
    });

    return `placed: ${charge.id}`;
  }
}
