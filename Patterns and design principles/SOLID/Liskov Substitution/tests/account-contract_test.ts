import { assert, assertEquals } from "@std/assert";
import type { Account } from "../src/good/account.ts";
import { CheckingAccount, OverdraftAccount, SavingsAccount } from "../src/good/accounts.ts";

/**
 * CONTRACT TESTS - the practical tool behind Liskov.
 *
 * One suite, run against every implementation. If a new subtype cannot pass these, it is not a
 * substitute for Account and must not implement the interface. Register new types here.
 */
const implementations: ReadonlyArray<[name: string, make: () => Account]> = [
  ["CheckingAccount", () => new CheckingAccount("t", 100)],
  ["SavingsAccount (limit 3)", () => new SavingsAccount("t", 100, 3)],
  ["SavingsAccount (limit 0, nothing available)", () => new SavingsAccount("t", 100, 0)],
  ["OverdraftAccount (credit 50)", () => new OverdraftAccount("t", 100, 50)],
];

for (const [name, make] of implementations) {
  Deno.test(`Account contract: ${name}`, async (t) => {
    await t.step("deposit increases balance by the amount", () => {
      const a = make();
      const before = a.balance;
      a.deposit(25);
      assertEquals(a.balance, before + 25);
    });

    await t.step("availableFunds is never negative", () => {
      assert(make().availableFunds() >= 0);
    });

    await t.step("withdraw within availableFunds succeeds and reduces balance exactly", () => {
      const a = make();
      const funds = a.availableFunds();
      if (funds === 0) return;
      const before = a.balance;
      const result = a.withdraw(funds);
      assertEquals(result, { ok: true, newBalance: before - funds });
      assertEquals(a.balance, before - funds);
    });

    await t.step("withdraw above availableFunds is declined and balance is unchanged", () => {
      const a = make();
      const before = a.balance;
      const result = a.withdraw(a.availableFunds() + 0.01);
      assertEquals(result.ok, false);
      assertEquals(a.balance, before);
    });

    await t.step("balance never drops below -creditLimit, however often we withdraw", () => {
      const a = make();
      for (let i = 0; i < 50; i++) {
        a.withdraw(7); // never throws, whatever the outcome
        assert(a.balance >= -a.creditLimit, `${a.balance} < ${-a.creditLimit}`);
      }
    });

    await t.step("withdraw never throws for positive amounts", () => {
      const a = make();
      for (const amount of [0.01, 1, 99.99, 100, 1_000_000]) a.withdraw(amount);
    });
  });
}
