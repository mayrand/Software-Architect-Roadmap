import {
  type Attachment,
  type DeliveryStatus,
  nextMessageId,
  type Reply,
} from "../shared/messages.ts";
import type {
  AttachmentSender,
  DeliveryTracker,
  MessageSender,
  PresenceSignaler,
  ReplyReader,
} from "./capabilities.ts";

/** Email: can send, attach and receive replies. Nothing else, and it does not pretend to. */
export class EmailChannel implements MessageSender, AttachmentSender, ReplyReader {
  readonly name = "email";
  send(to: string, text: string): Promise<string> {
    console.log(`   [email] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("mail"));
  }
  sendAttachment(to: string, a: Attachment): Promise<string> {
    console.log(`   [email] to ${to}: attached ${a.fileName} (${a.sizeKb} KB)`);
    return Promise.resolve(nextMessageId("mail"));
  }
  fetchReplies(_since: Date): Promise<Reply[]> {
    return Promise.resolve([{ from: "customer@example.com", text: "Thanks, received." }]);
  }
}

/** SMS: send and delivery receipts. */
export class SmsChannel implements MessageSender, DeliveryTracker {
  readonly name = "sms";
  send(to: string, text: string): Promise<string> {
    console.log(`   [sms] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("sms"));
  }
  deliveryStatus(_messageId: string): Promise<DeliveryStatus> {
    return Promise.resolve("delivered");
  }
}

/** Push: fire-and-forget. One method, one interface. */
export class PushChannel implements MessageSender {
  readonly name = "push";
  send(to: string, text: string): Promise<string> {
    console.log(`   [push] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("push"));
  }
}

/** Slack really does support everything, so it implements everything. */
export class SlackChannel
  implements MessageSender, AttachmentSender, ReplyReader, DeliveryTracker, PresenceSignaler {
  readonly name = "slack";
  send(to: string, text: string): Promise<string> {
    console.log(`   [slack] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("slack"));
  }
  sendAttachment(to: string, a: Attachment): Promise<string> {
    console.log(`   [slack] to ${to}: uploaded ${a.fileName}`);
    return Promise.resolve(nextMessageId("slack"));
  }
  fetchReplies(_since: Date): Promise<Reply[]> {
    return Promise.resolve([{ from: "@grace", text: "On it." }]);
  }
  deliveryStatus(_messageId: string): Promise<DeliveryStatus> {
    return Promise.resolve("delivered");
  }
  setTyping(to: string, typing: boolean): Promise<void> {
    console.log(`   [slack] ${to}: typing indicator ${typing ? "on" : "off"}`);
    return Promise.resolve();
  }
}
