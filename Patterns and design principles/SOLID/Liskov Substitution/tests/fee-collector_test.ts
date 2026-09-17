import { assertEquals } from "@std/assert";
import type { Account } from "../src/good/account.ts";
import { CheckingAccount, OverdraftAccount, SavingsAccount } from "../src/good/accounts.ts";
import { auditLedger, collectMonthlyFee } from "../src/good/fee-collector.ts";

Deno.test("fee collector handles every account type through the contract alone", () => {
  const savings = new SavingsAccount("Grace", 500, 3);
  savings.withdraw(1);
  savings.withdraw(1);
  savings.withdraw(1);
  const accounts = [
    new CheckingAccount("Ada", 100),
    savings,
    new OverdraftAccount("Linus", 2, 200),
    new CheckingAccount("Poor", 1),
  ];

  const report = collectMonthlyFee(accounts, 5);

  assertEquals(report.charged, ["Ada", "Linus"]);
  assertEquals(report.waived.map((w) => w.owner), ["Grace", "Poor"]);
  assertEquals(accounts[2].balance, -3); // within the declared credit limit
  assertEquals(auditLedger(accounts), []);
});

Deno.test("audit reports only balances below the declared limit", () => {
  const withinLimit = new OverdraftAccount("Linus", -10, 50);
  const corrupt: Account = {
    owner: "Bug",
    balance: -1,
    creditLimit: 0,
    availableFunds: () => 0,
    deposit() {},
    withdraw: () => ({ ok: false, reason: "stub" }),
  };
  assertEquals(auditLedger([withinLimit, corrupt]).length, 1);
});
