import type { Reply } from "../shared/messages.ts";
import type {
  AttachmentSender,
  MessageSender,
  PresenceSignaler,
  ReplyReader,
} from "./capabilities.ts";

/**
 * GOOD - each client asks for exactly the capability it uses.
 * Wiring a channel that lacks the capability is a COMPILE error (see tests/type-safety_test.ts).
 * A test double needs one method, not five.
 */
export class AlertService {
  constructor(private readonly sender: MessageSender) {}
  raise(to: string, text: string): Promise<string> {
    return this.sender.send(to, `ALERT: ${text}`);
  }
}

export class InvoiceMailer {
  constructor(private readonly sender: AttachmentSender) {}
  sendInvoice(to: string, invoiceNo: string): Promise<string> {
    return this.sender.sendAttachment(to, { fileName: `${invoiceNo}.pdf`, sizeKb: 120 });
  }
}

export class SupportInbox {
  constructor(private readonly reader: ReplyReader) {}
  unreadSince(since: Date): Promise<Reply[]> {
    return this.reader.fetchReplies(since);
  }
}

/** Needs two capabilities: compose them with an intersection type instead of a fat interface. */
export class LiveChat {
  constructor(private readonly channel: MessageSender & PresenceSignaler) {}
  async respond(to: string, text: string): Promise<string> {
    await this.channel.setTyping(to, true);
    const id = await this.channel.send(to, text);
    await this.channel.setTyping(to, false);
    return id;
  }
}
