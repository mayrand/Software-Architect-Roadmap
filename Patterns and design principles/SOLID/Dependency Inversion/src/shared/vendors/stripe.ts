import { networkRoundTrip } from "./latency.ts";

/**
 * Simulated third-party payment SDK. We do not own this code or its vocabulary
 * (amount_cents, source, failure_message). Both examples use this same SDK; the difference
 * is WHO depends on it.
 */
export interface StripeChargeRequest {
  readonly amount_cents: number;
  readonly currency: string;
  readonly source: { readonly number: string; readonly name: string };
  readonly description: string;
}

export interface StripeChargeResponse {
  readonly id: string;
  readonly status: "succeeded" | "failed";
  readonly failure_message?: string;
}

export class StripeClient {
  private counter = 0;

  constructor(private readonly apiKey: string) {}

  async createCharge(request: StripeChargeRequest): Promise<StripeChargeResponse> {
    await networkRoundTrip();
    this.counter++;
    const id = `ch_${this.apiKey.slice(-4)}_${this.counter}`;
    if (request.source.number.endsWith("0000")) {
      console.log(`   [stripe] POST /v1/charges ${request.amount_cents} -> card_declined`);
      return { id, status: "failed", failure_message: "Your card was declined." };
    }
    console.log(`   [stripe] POST /v1/charges ${request.amount_cents} -> succeeded ${id}`);
    return { id, status: "succeeded" };
  }
}
