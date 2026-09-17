import type { Attachment, DeliveryStatus, Reply } from "../shared/messages.ts";

/**
 * GOOD - one small interface per capability ("role interfaces").
 *
 * A channel implements exactly the capabilities it really has. A client depends on exactly the
 * capability it really uses. The compiler, not production, tells you when they do not match.
 */
export interface Channel {
  readonly name: string;
}

export interface MessageSender extends Channel {
  send(to: string, text: string): Promise<string>;
}

export interface AttachmentSender extends Channel {
  sendAttachment(to: string, attachment: Attachment): Promise<string>;
}

export interface ReplyReader extends Channel {
  fetchReplies(since: Date): Promise<Reply[]>;
}

export interface DeliveryTracker extends Channel {
  deliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

export interface PresenceSignaler extends Channel {
  setTyping(to: string, typing: boolean): Promise<void>;
}

/**
 * For heterogeneous lists ("all configured channels") capability checks are explicit type
 * guards instead of try/catch around a method that might throw NotSupported.
 */
export function canReadReplies(c: Channel): c is Channel & ReplyReader {
  return typeof (c as Partial<ReplyReader>).fetchReplies === "function";
}

export function canSendAttachments(c: Channel): c is Channel & AttachmentSender {
  return typeof (c as Partial<AttachmentSender>).sendAttachment === "function";
}
