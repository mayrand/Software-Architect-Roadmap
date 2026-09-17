/**
 * SOLID catalog - Liskov Substitution Principle (LSP)
 *
 * Run:   deno task start
 * Test:  deno task test
 *
 * "Objects of a supertype shall be replaceable with objects of its subtypes without breaking
 * the program." Both demos run the same month-end job over the same four customers.
 */
import * as bad from "./src/bad/accounts.ts";
import {
  auditLedger,
  collectMonthlyFeeDefensive,
  collectMonthlyFeeNaive,
} from "./src/bad/fee-collector.ts";
import type { Account } from "./src/good/account.ts";
import * as good from "./src/good/accounts.ts";
import { auditLedger as auditLedgerGood, collectMonthlyFee } from "./src/good/fee-collector.ts";
import { TermDeposit } from "./src/good/term-deposit.ts";
import { section } from "./src/shared/console-log.ts";
import { formatMoney } from "./src/shared/money.ts";

const FEE = 5;

function runBadExample(): void {
  section("BAD - subclasses that lie about being Accounts (src/bad/*)");
  const savings = new bad.SavingsAccount("Grace Hopper", 500);
  savings.withdraw(50);
  savings.withdraw(50);
  savings.withdraw(50); // monthly limit used up before the fee run
  const accounts: bad.Account[] = [
    new bad.Account("Ada Lovelace", 100),
    savings,
    new bad.OverdraftAccount("Linus Torvalds", 2, 200),
    new bad.FixedTermDeposit("Barbara Liskov", 10_000, "2027-01-01"),
  ];

  console.log("\n1) Client written against the contract:");
  try {
    collectMonthlyFeeNaive(accounts, FEE);
  } catch (error) {
    console.log(`   CRASH mid-batch: ${(error as Error).message}`);
    console.log("   Ada was charged, nobody after her was. Partial state, month-end job red.");
  }

  console.log("\n2) Client after three incidents (instanceof for every subclass):");
  const report = collectMonthlyFeeDefensive(accounts, FEE);
  console.log(`   charged: ${report.charged.join(", ")}`);
  console.log(`   waived:  ${report.waived.join(", ")}`);

  console.log("\n3) Audit that trusts 'balance is never negative':");
  for (const anomaly of auditLedger(accounts)) console.log(`   FALSE ALARM -> ${anomaly}`);
}

function runGoodExample(): void {
  section("GOOD - one contract, every subtype keeps it (src/good/*)");
  const savings = new good.SavingsAccount("Grace Hopper", 500);
  savings.withdraw(50);
  savings.withdraw(50);
  savings.withdraw(50);
  const accounts: Account[] = [
    new good.CheckingAccount("Ada Lovelace", 100),
    savings,
    new good.OverdraftAccount("Linus Torvalds", 2, 200),
  ];
  // A term deposit is not an Account, so the compiler will not let it into the list above.
  const barbara = new TermDeposit("Barbara Liskov", 10_000, 0.04, "2027-01-01");

  console.log("\n1) Same client, no instanceof, no try/catch:");
  const report = collectMonthlyFee(accounts, FEE);
  console.log(`   charged: ${report.charged.join(", ")}`);
  for (const w of report.waived) console.log(`   waived:  ${w.owner} (${w.reason})`);
  for (const a of accounts) {
    const balance = formatMoney(a.balance).padStart(9);
    console.log(`   ${a.owner.padEnd(16)} balance ${balance}  limit ${formatMoney(a.creditLimit)}`);
  }

  console.log("\n2) Audit against the declared invariant (balance >= -creditLimit):");
  const anomalies = auditLedgerGood(accounts);
  console.log(anomalies.length === 0 ? "   ledger clean" : anomalies.join("\n"));

  console.log("\n3) The term deposit lives outside the hierarchy:");
  console.log(
    `   ${barbara.owner}: ${formatMoney(barbara.principal)} locked until ${barbara.maturesOn}`,
  );
  const matured = barbara.matureInto(1);
  console.log(`   after 1 year it becomes a CheckingAccount with ${formatMoney(matured.balance)}`);
}

if (import.meta.main) {
  runBadExample();
  runGoodExample();
}
