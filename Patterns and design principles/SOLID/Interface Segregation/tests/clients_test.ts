import { assertEquals } from "@std/assert";
import type {
  AttachmentSender,
  MessageSender,
  PresenceSignaler,
} from "../src/good/capabilities.ts";
import { AlertService, InvoiceMailer, LiveChat } from "../src/good/clients.ts";

/** One-method fakes. Compare with the five-method fake in bad-fat-fake_test.ts. */
Deno.test("AlertService prefixes the text and sends it", async () => {
  const sent: string[] = [];
  const sender: MessageSender = {
    name: "fake",
    send: (to, text) => {
      sent.push(`${to}|${text}`);
      return Promise.resolve("id-1");
    },
  };
  assertEquals(await new AlertService(sender).raise("ada", "disk 91%"), "id-1");
  assertEquals(sent, ["ada|ALERT: disk 91%"]);
});

Deno.test("InvoiceMailer attaches a PDF named after the invoice", async () => {
  let fileName = "";
  const sender: AttachmentSender = {
    name: "fake",
    sendAttachment: (_to, a) => {
      fileName = a.fileName;
      return Promise.resolve("id-2");
    },
  };
  await new InvoiceMailer(sender).sendInvoice("grace", "INV-7");
  assertEquals(fileName, "INV-7.pdf");
});

Deno.test("LiveChat toggles typing around the message", async () => {
  const events: string[] = [];
  const channel: MessageSender & PresenceSignaler = {
    name: "fake",
    send: (_to, text) => {
      events.push(`send:${text}`);
      return Promise.resolve("id-3");
    },
    setTyping: (_to, typing) => {
      events.push(`typing:${typing}`);
      return Promise.resolve();
    },
  };
  await new LiveChat(channel).respond("linus", "hi");
  assertEquals(events, ["typing:true", "send:hi", "typing:false"]);
});
