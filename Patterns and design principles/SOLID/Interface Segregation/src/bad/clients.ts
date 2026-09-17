import type { Reply } from "../shared/messages.ts";
import type { MessageChannel } from "./message-channel.ts";

/**
 * Each client uses ONE method, but depends on the whole fat interface.
 * Any channel can be injected into any client; the compiler is happy, production is not.
 */
export class AlertService {
  constructor(private readonly channel: MessageChannel) {}
  raise(to: string, text: string): Promise<string> {
    return this.channel.send(to, `ALERT: ${text}`);
  }
}

export class InvoiceMailer {
  constructor(private readonly channel: MessageChannel) {}
  sendInvoice(to: string, invoiceNo: string): Promise<string> {
    return this.channel.sendAttachment(to, { fileName: `${invoiceNo}.pdf`, sizeKb: 120 });
  }
}

export class SupportInbox {
  constructor(private readonly channel: MessageChannel) {}
  unreadSince(since: Date): Promise<Reply[]> {
    return this.channel.fetchReplies(since);
  }
}

export class LiveChat {
  constructor(private readonly channel: MessageChannel) {}
  async respond(to: string, text: string): Promise<string> {
    await this.channel.setTyping(to, true);
    const id = await this.channel.send(to, text);
    await this.channel.setTyping(to, false);
    return id;
  }
}
