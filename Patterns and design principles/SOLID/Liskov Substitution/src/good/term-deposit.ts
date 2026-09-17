import { CheckingAccount } from "./accounts.ts";

/**
 * A term deposit cannot honor `withdraw`, so it does NOT claim to be an `Account`.
 *
 * This is the other half of Liskov: when a type cannot keep the base contract, do not inherit.
 * Model it as what it is. The compiler now refuses to hand a TermDeposit to any code that expects
 * an Account (see tests/term-deposit_test.ts), which is exactly the protection the bad design lost.
 */
export class TermDeposit {
  constructor(
    readonly owner: string,
    readonly principal: number,
    readonly annualRate: number,
    readonly maturesOn: string,
  ) {}

  /** At maturity the money becomes a normal account again, with interest. */
  matureInto(years: number): CheckingAccount {
    const finalAmount = this.principal * (1 + this.annualRate) ** years;
    return new CheckingAccount(this.owner, Math.round(finalAmount * 100) / 100);
  }
}
