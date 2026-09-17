import {
  type Attachment,
  type DeliveryStatus,
  nextMessageId,
  NotSupportedError,
  type Reply,
} from "../shared/messages.ts";
import type { MessageChannel } from "./message-channel.ts";

/**
 * The usual "fix" for a fat interface: a base class where everything throws, so implementers
 * only override what they support. It makes the code compile. It does NOT make it correct:
 * the compiler now believes every channel can do everything.
 */
abstract class ChannelBase implements MessageChannel {
  abstract readonly name: string;

  send(_to: string, _text: string): Promise<string> {
    return Promise.reject(new NotSupportedError(this.name, "send"));
  }
  sendAttachment(_to: string, _attachment: Attachment): Promise<string> {
    return Promise.reject(new NotSupportedError(this.name, "sendAttachment"));
  }
  fetchReplies(_since: Date): Promise<Reply[]> {
    return Promise.reject(new NotSupportedError(this.name, "fetchReplies"));
  }
  deliveryStatus(_messageId: string): Promise<DeliveryStatus> {
    return Promise.reject(new NotSupportedError(this.name, "deliveryStatus"));
  }
  setTyping(_to: string, _typing: boolean): Promise<void> {
    return Promise.reject(new NotSupportedError(this.name, "setTyping"));
  }
}

export class EmailChannel extends ChannelBase {
  readonly name = "email";
  override send(to: string, text: string): Promise<string> {
    console.log(`   [email] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("mail"));
  }
  override sendAttachment(to: string, a: Attachment): Promise<string> {
    console.log(`   [email] to ${to}: attached ${a.fileName} (${a.sizeKb} KB)`);
    return Promise.resolve(nextMessageId("mail"));
  }
  override fetchReplies(_since: Date): Promise<Reply[]> {
    return Promise.resolve([{ from: "customer@example.com", text: "Thanks, received." }]);
  }
  // deliveryStatus: email has no read receipts   -> inherits throw
  // setTyping:      email has no presence        -> inherits throw
}

export class SmsChannel extends ChannelBase {
  readonly name = "sms";
  override send(to: string, text: string): Promise<string> {
    console.log(`   [sms] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("sms"));
  }
  override deliveryStatus(_messageId: string): Promise<DeliveryStatus> {
    return Promise.resolve("delivered");
  }
  // sendAttachment, fetchReplies, setTyping -> inherit throw
}

export class PushChannel extends ChannelBase {
  readonly name = "push";
  override send(to: string, text: string): Promise<string> {
    console.log(`   [push] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("push"));
  }
  // everything else -> inherits throw
}

export class SlackChannel extends ChannelBase {
  readonly name = "slack";
  override send(to: string, text: string): Promise<string> {
    console.log(`   [slack] to ${to}: ${text}`);
    return Promise.resolve(nextMessageId("slack"));
  }
  override sendAttachment(to: string, a: Attachment): Promise<string> {
    console.log(`   [slack] to ${to}: uploaded ${a.fileName}`);
    return Promise.resolve(nextMessageId("slack"));
  }
  override fetchReplies(_since: Date): Promise<Reply[]> {
    return Promise.resolve([{ from: "@grace", text: "On it." }]);
  }
  override deliveryStatus(_messageId: string): Promise<DeliveryStatus> {
    return Promise.resolve("delivered");
  }
  override setTyping(to: string, typing: boolean): Promise<void> {
    console.log(`   [slack] ${to}: typing indicator ${typing ? "on" : "off"}`);
    return Promise.resolve();
  }
}
