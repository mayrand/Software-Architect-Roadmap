# SOLID catalog - Liskov Substitution Principle

A small Deno app that shows the **same feature built twice**: once violating the Liskov Substitution
Principle (LSP) and once respecting it. Both variants run a month-end "collect the $5 account fee"
job over the same customers.

> If S is a subtype of T, objects of type T may be replaced with objects of type S without altering
> any of the desirable properties of the program. - Barbara Liskov

In practice: a subtype must keep the **contract** of its base type, not just its method signatures.
The contract has three parts, and a subtype may not:

| Rule                        | A subtype may not...          | Bad example here                                     |
| --------------------------- | ----------------------------- | ---------------------------------------------------- |
| Preconditions               | demand more from callers      | `SavingsAccount` adds "max 3 withdrawals" and throws |
| Postconditions / invariants | promise less to callers       | `OverdraftAccount` lets balance go negative          |
| Exceptions                  | throw where the base does not | `FixedTermDeposit.withdraw` always throws            |

## Run

```bash
deno task start   # run both demos
deno task test    # contract tests over every implementation + compile-time proof
deno task check   # fmt + lint + type-check
```

## Layout

```
main.ts                          runs both demos
src/shared/money.ts              helpers used by both
src/bad/
  accounts.ts                    Account base class + three lying subclasses
  fee-collector.ts               the client: naive version, then the instanceof-riddled version
src/good/
  account.ts                     the Account CONTRACT (interface) + BaseAccount template
  accounts.ts                    Checking, Savings, Overdraft: same rules, contract kept
  term-deposit.ts                NOT an Account, because it cannot honor withdraw
  fee-collector.ts               the client: one loop, no instanceof, never changes
tests/
  account-contract_test.ts       one suite run against every implementation
  fee-collector_test.ts          client works through the contract alone
  term-deposit_test.ts           @ts-expect-error: compiler rejects TermDeposit as Account
```

## The bad example

`src/bad/fee-collector.ts` shows the client twice. The naive version is _correct by the base
contract_ and crashes mid-batch the moment a `SavingsAccount` or `FixedTermDeposit` appears, leaving
half the customers charged. The defensive version survives by checking `instanceof` for every
subclass, which means:

- the client must know every subtype, so adding one means editing the client;
- the base type is now useless as an abstraction, since nobody can trust it;
- the audit that trusts "balance is never negative" raises false alarms on overdrafts.

## The good example

Three moves fix it:

1. **Write the contract down and make it wide enough for the whole family.** `withdraw` returns `ok`
   or `declined` instead of throwing, and `availableFunds()` is where each subtype expresses its own
   rules. Savings limits and overdraft credit become _part of_ the contract rather than exceptions
   to it.
2. **Enforce the contract in one place.** `BaseAccount` is a template: the decline-or-succeed logic
   is final, subtypes only fill in hooks.
3. **Do not inherit when you cannot comply.** `TermDeposit` is its own type. The compiler now
   refuses to pass it where an `Account` is expected; see the `@ts-expect-error` in
   `tests/term-deposit_test.ts`.

The payoff is `tests/account-contract_test.ts`: a single suite that every implementation must pass.
A new account type registers there, and if it lies, the build fails.

## Heuristics for spotting LSP violations

- `instanceof` or type-tag checks in code that receives the base type.
- An override that throws `NotSupported` or an exception the base never documented.
- An override with an extra `if` guard at the top that the base does not have.
- Comments like "do not call X on a Y" or "make sure to call `init()` first".
- Subclasses created to _remove_ behavior rather than to specialize it.
- The classic: `Square extends Rectangle` where setting the width also changes the height.
