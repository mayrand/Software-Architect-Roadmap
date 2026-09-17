/**
 * SOLID catalog - Interface Segregation Principle (ISP)
 *
 * Run:   deno task start
 * Test:  deno task test
 *
 * "No client should be forced to depend on methods it does not use."
 * Both demos wire the same four clients to the same four channels.
 */
import * as bad from "./src/bad/channels.ts";
import * as badClients from "./src/bad/clients.ts";
import { canReadReplies, canSendAttachments, type Channel } from "./src/good/capabilities.ts";
import * as good from "./src/good/channels.ts";
import * as goodClients from "./src/good/clients.ts";
import { section } from "./src/shared/console-log.ts";

const SINCE = new Date("2026-09-01");

async function attempt(label: string, action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
    console.log(`   OK    ${label}`);
  } catch (error) {
    console.log(`   BOOM  ${label}: ${(error as Error).message}`);
  }
}

async function runBadExample(): Promise<void> {
  section("BAD - one fat MessageChannel interface (src/bad/*)");
  console.log("\nAll of these compile. The type system has no idea which will explode:");
  await attempt(
    "AlertService + push",
    () => new badClients.AlertService(new bad.PushChannel()).raise("ada", "disk 91%"),
  );
  await attempt(
    "InvoiceMailer + email",
    () => new badClients.InvoiceMailer(new bad.EmailChannel()).sendInvoice("grace", "INV-1"),
  );
  await attempt(
    "InvoiceMailer + sms",
    () => new badClients.InvoiceMailer(new bad.SmsChannel()).sendInvoice("grace", "INV-2"),
  );
  await attempt(
    "SupportInbox + push",
    () => new badClients.SupportInbox(new bad.PushChannel()).unreadSince(SINCE),
  );
  await attempt(
    "LiveChat + email",
    () => new badClients.LiveChat(new bad.EmailChannel()).respond("linus", "hi"),
  );
  console.log(
    "\nAnd tests/bad-fat-fake_test.ts shows the 5-method fake needed to test a 1-method client.",
  );
}

async function runGoodExample(): Promise<void> {
  section("GOOD - one small interface per capability (src/good/*)");
  console.log("\nClients declare what they need; only matching channels are accepted:");
  await attempt(
    "AlertService + push",
    () => new goodClients.AlertService(new good.PushChannel()).raise("ada", "disk 91%"),
  );
  await attempt(
    "InvoiceMailer + email",
    () => new goodClients.InvoiceMailer(new good.EmailChannel()).sendInvoice("grace", "INV-1"),
  );
  await attempt(
    "SupportInbox + slack",
    () => new goodClients.SupportInbox(new good.SlackChannel()).unreadSince(SINCE),
  );
  await attempt(
    "LiveChat + slack",
    () => new goodClients.LiveChat(new good.SlackChannel()).respond("linus", "hi"),
  );
  console.log("\n   InvoiceMailer + sms, SupportInbox + push, LiveChat + email:");
  console.log(
    "   these do not compile. See the @ts-expect-error lines in tests/type-safety_test.ts.",
  );

  console.log("\nHeterogeneous list: capabilities are discovered with type guards, not try/catch:");
  const all: Channel[] = [
    new good.EmailChannel(),
    new good.SmsChannel(),
    new good.PushChannel(),
    new good.SlackChannel(),
  ];
  for (const channel of all) {
    const caps = [
      canSendAttachments(channel) ? "attachments" : null,
      canReadReplies(channel) ? "replies" : null,
    ].filter(Boolean);
    console.log(`   ${channel.name.padEnd(6)} -> ${caps.length ? caps.join(", ") : "send only"}`);
  }
  for (const channel of all.filter(canReadReplies)) {
    const replies = await new goodClients.SupportInbox(channel).unreadSince(SINCE);
    console.log(
      `   inbox via ${channel.name}: ${replies.map((r) => `${r.from}: "${r.text}"`).join("; ")}`,
    );
  }
}

if (import.meta.main) {
  await runBadExample();
  await runGoodExample();
}
