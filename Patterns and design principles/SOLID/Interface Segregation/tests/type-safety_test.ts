import { assertEquals } from "@std/assert";
import { canReadReplies, canSendAttachments } from "../src/good/capabilities.ts";
import { EmailChannel, PushChannel, SlackChannel, SmsChannel } from "../src/good/channels.ts";
import { InvoiceMailer, LiveChat, SupportInbox } from "../src/good/clients.ts";

/**
 * Compile-time proof. `deno test` type-checks this file, and each `@ts-expect-error` FAILS the
 * type check if the line ever becomes legal. In the bad design all three compile and throw at
 * runtime instead. This function is never executed.
 */
export function wrongWiringDoesNotCompile(): void {
  // @ts-expect-error SmsChannel has no sendAttachment
  new InvoiceMailer(new SmsChannel());
  // @ts-expect-error PushChannel has no fetchReplies
  new SupportInbox(new PushChannel());
  // @ts-expect-error EmailChannel has no setTyping
  new LiveChat(new EmailChannel());
}

Deno.test("capability guards classify channels by what they actually implement", () => {
  const channels = [new EmailChannel(), new SmsChannel(), new PushChannel(), new SlackChannel()];
  assertEquals(channels.filter(canSendAttachments).map((c) => c.name), ["email", "slack"]);
  assertEquals(channels.filter(canReadReplies).map((c) => c.name), ["email", "slack"]);
});
