import { assertEquals, assertRejects } from "@std/assert";
import { SmsChannel } from "../src/bad/channels.ts";
import { AlertService, InvoiceMailer } from "../src/bad/clients.ts";
import type { MessageChannel } from "../src/bad/message-channel.ts";
import { NotSupportedError } from "../src/shared/messages.ts";

/**
 * The client-side cost of a fat interface: to test AlertService, which calls ONE method,
 * the fake must implement all FIVE. Four of them are noise that can only hide bugs.
 */
Deno.test("bad: a one-method client needs a five-method fake", async () => {
  const sent: string[] = [];
  const fake: MessageChannel = {
    name: "fake",
    send: (to, text) => {
      sent.push(`${to}|${text}`);
      return Promise.resolve("id-1");
    },
    sendAttachment: () => Promise.reject(new Error("not needed by this test")),
    fetchReplies: () => Promise.reject(new Error("not needed by this test")),
    deliveryStatus: () => Promise.reject(new Error("not needed by this test")),
    setTyping: () => Promise.reject(new Error("not needed by this test")),
  };
  await new AlertService(fake).raise("ada", "disk 91%");
  assertEquals(sent, ["ada|ALERT: disk 91%"]);
});

Deno.test("bad: wrong wiring compiles and fails at runtime", async () => {
  const mailer = new InvoiceMailer(new SmsChannel()); // the compiler is fine with this
  await assertRejects(() => mailer.sendInvoice("grace", "INV-2"), NotSupportedError);
});
