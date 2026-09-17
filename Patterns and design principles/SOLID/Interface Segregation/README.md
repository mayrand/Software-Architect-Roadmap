# SOLID catalog - Interface Segregation Principle

A small Deno app that shows the **same feature built twice**: once violating the Interface
Segregation Principle (ISP) and once respecting it. Both variants wire four clients (alerts,
invoices, support inbox, live chat) to four channels (email, SMS, push, Slack).

> No client should be forced to depend on methods it does not use. - Robert C. Martin

The principle is about the **client's** view. A big interface hurts twice: implementers must fake
methods they cannot support, and clients are coupled to methods they never call.

## Run

```bash
deno task start   # run both demos
deno task test    # one-method fakes, compile-time proofs, and the fat-fake counterexample
deno task check   # fmt + lint + type-check
```

## Layout

```
main.ts                          runs both demos
src/shared/messages.ts           domain model used by both
src/bad/
  message-channel.ts             ONE fat interface with five methods
  channels.ts                    base class where everything throws, subclasses override some
  clients.ts                     four clients, each using one method, each depending on five
src/good/
  capabilities.ts                five one-method interfaces + type guards for discovery
  channels.ts                    each channel implements only what it truly supports
  clients.ts                     each client asks for exactly the capability it uses
tests/
  clients_test.ts                good clients tested with one-method fakes
  type-safety_test.ts            @ts-expect-error: wrong wiring does not compile
  bad-fat-fake_test.ts           the five-method fake, and a runtime NotSupportedError
```

## The bad example

`MessageChannel` is the union of everything any channel can do. Real channels support a subset, so
`channels.ts` uses the usual trick: a base class where every method throws `NotSupportedError`, and
subclasses override the ones they have. It compiles. Then:

| What happens                                                      | Where to see it                 |
| ----------------------------------------------------------------- | ------------------------------- |
| `InvoiceMailer` wired to SMS compiles and explodes at runtime     | `deno task start`, `BOOM` lines |
| Testing a one-method client needs a five-method fake              | `tests/bad-fat-fake_test.ts`    |
| Changing `deliveryStatus` recompiles email, push and every client | the single interface            |
| Callers wrap calls in try/catch "just in case"                    | the only defense left           |

## The good example

`capabilities.ts` splits the fat interface into five **role interfaces**: `MessageSender`,
`AttachmentSender`, `ReplyReader`, `DeliveryTracker`, `PresenceSignaler`.

- A channel implements the roles it really has. `PushChannel` implements one interface,
  `SlackChannel` implements five, and neither lies.
- A client declares the role it needs. `LiveChat` needs two, so it takes
  `MessageSender & PresenceSignaler`. Intersection types compose small interfaces on demand.
- Wrong wiring is now a **compile error**. `tests/type-safety_test.ts` pins that down with
  `@ts-expect-error` lines that would fail the build if the mismatch ever became legal.
- For a heterogeneous list of channels, capability discovery is an explicit type guard such as
  `canReadReplies`, not a try/catch around a method that may throw.

## Relationship to the other principles

ISP is SRP applied to interfaces, seen from the consumer side. It also protects Liskov: a class that
must implement a method it cannot honor has no option but to throw, which is exactly the
substitution violation the previous project showed.

## Heuristics for spotting ISP violations

- Methods that throw `NotSupported` / `NotImplemented`, or empty method bodies.
- A test double that stubs many methods to test one.
- Interfaces named after a _thing_ (`Channel`, `Device`, `Repository`) with a dozen methods, rather
  than after a _capability_ (`Sender`, `Switchable`, `Reader`).
- Boolean capability flags such as `supportsAttachments` checked before calling a method.
- A change to one method's signature forcing edits in classes that never call it.
