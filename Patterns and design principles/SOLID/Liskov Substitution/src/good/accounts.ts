import { BaseAccount } from "./account.ts";

/** Plain account: available funds are simply the balance. */
export class CheckingAccount extends BaseAccount {
  constructor(owner: string, openingBalance = 0) {
    super(owner, openingBalance, 0);
  }

  availableFunds(): number {
    return this._balance;
  }
}

/**
 * Same business rule as the bad SavingsAccount ("N withdrawals per period"), expressed INSIDE
 * the contract: when the limit is used up, availableFunds() is 0 and withdraw() declines with a
 * reason. No hidden precondition, no surprise exception.
 */
export class SavingsAccount extends BaseAccount {
  private withdrawalsThisPeriod = 0;

  constructor(owner: string, openingBalance = 0, private readonly maxWithdrawals = 3) {
    super(owner, openingBalance, 0);
  }

  availableFunds(): number {
    return this.withdrawalsThisPeriod < this.maxWithdrawals ? this._balance : 0;
  }

  startNewPeriod(): void {
    this.withdrawalsThisPeriod = 0;
  }

  protected override declineReason(amount: number): string {
    if (this.withdrawalsThisPeriod >= this.maxWithdrawals) {
      return `${this.owner}: ${this.maxWithdrawals} withdrawals per period already used`;
    }
    return super.declineReason(amount);
  }

  protected override onWithdrawn(): void {
    this.withdrawalsThisPeriod++;
  }
}

/**
 * Same business rule as the bad OverdraftAccount, but the invariant is DECLARED instead of
 * broken: balance >= -creditLimit, and creditLimit is visible to every caller.
 */
export class OverdraftAccount extends BaseAccount {
  constructor(owner: string, openingBalance = 0, creditLimit = 0) {
    super(owner, openingBalance, creditLimit);
  }

  availableFunds(): number {
    return this._balance + this.creditLimit;
  }
}
