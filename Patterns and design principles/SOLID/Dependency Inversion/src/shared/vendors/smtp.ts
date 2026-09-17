import { networkRoundTrip } from "./latency.ts";

export interface MailOptions {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
}

/** Simulated mail transport. */
export class SmtpTransport {
  constructor(private readonly host: string) {}

  async sendMail(options: MailOptions): Promise<void> {
    await networkRoundTrip();
    console.log(`   [smtp ${this.host}] to ${options.to}: "${options.subject}"`);
  }
}
