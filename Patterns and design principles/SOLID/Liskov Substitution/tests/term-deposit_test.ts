import { assertEquals } from "@std/assert";
import { collectMonthlyFee } from "../src/good/fee-collector.ts";
import { TermDeposit } from "../src/good/term-deposit.ts";

/**
 * Compile-time proof. `deno test` type-checks this file; the `@ts-expect-error` line FAILS the
 * type check if the call ever becomes legal. This function is never executed.
 */
export function termDepositIsNotAnAccount(): void {
  const deposit = new TermDeposit("Barbara", 10_000, 0.04, "2027-01-01");
  // @ts-expect-error TermDeposit is not assignable to Account, by design.
  collectMonthlyFee([deposit], 5);
}

Deno.test("a term deposit matures into an ordinary account with interest", () => {
  const deposit = new TermDeposit("Barbara", 10_000, 0.04, "2027-01-01");
  const account = deposit.matureInto(2);
  assertEquals(account.owner, "Barbara");
  assertEquals(account.balance, 10_816);
  assertEquals(account.withdraw(16), { ok: true, newBalance: 10_800 });
});
