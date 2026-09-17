import type { Attachment, DeliveryStatus, Reply } from "../shared/messages.ts";

/**
 * BAD: Interface Segregation Principle violated.
 *
 * One "fat" interface that is the union of everything ANY channel can do. Every implementer must
 * provide all five methods even though no real channel supports all five, and every client is
 * coupled to all five even though each client uses exactly one.
 *
 * Consequences:
 *   - Implementers are forced to write methods that throw NotSupportedError.
 *   - A client compiles against any channel and finds out at runtime that it picked a wrong one.
 *   - A test double for a one-method client must implement five methods.
 *   - Changing the signature of `deliveryStatus` forces every channel and every client to
 *     recompile, including the ones that never track delivery.
 */
export interface MessageChannel {
  readonly name: string;
  send(to: string, text: string): Promise<string>;
  sendAttachment(to: string, attachment: Attachment): Promise<string>;
  fetchReplies(since: Date): Promise<Reply[]>;
  deliveryStatus(messageId: string): Promise<DeliveryStatus>;
  setTyping(to: string, typing: boolean): Promise<void>;
}
