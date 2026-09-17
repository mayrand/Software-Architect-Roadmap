import { assertPositiveAmount } from "../shared/money.ts";

export type WithdrawalResult =
  | { readonly ok: true; readonly newBalance: number }
  | { readonly ok: false; readonly reason: string };

/**
 * GOOD - a contract wide enough for the whole family, and narrow enough to rely on.
 *
 * Every implementation MUST honor these rules. `tests/account-contract_test.ts` runs the same
 * suite against every implementation, so a new subtype that lies is caught before it ships.
 *
 *   deposit(amount)       amount > 0 -> balance increases by exactly `amount`.
 *   availableFunds()      >= 0 always. The amount that CAN be withdrawn right now, whatever the
 *                         reason (money, policy, limits...). Subtypes express their rules here.
 *   withdraw(amount)      pre: amount > 0 (anything else is a programmer error and throws).
 *                         amount <= availableFunds()  -> ok, balance decreases by exactly `amount`.
 *                         amount >  availableFunds()  -> declined with a reason, balance unchanged.
 *                         NEVER throws for business reasons.
 *   invariant             balance >= -creditLimit at all times. creditLimit is 0 unless the account
 *                         says otherwise, and callers can read it.
 *   no setup required     an Account is usable the moment it is constructed.
 */
export interface Account {
  readonly owner: string;
  readonly balance: number;
  readonly creditLimit: number;
  availableFunds(): number;
  deposit(amount: number): void;
  withdraw(amount: number): WithdrawalResult;
}

/**
 * Template base: enforces the contract in ONE place. Subtypes vary only through the hooks,
 * so they physically cannot skip the "declined instead of throw" rule or corrupt the balance.
 */
export abstract class BaseAccount implements Account {
  protected _balance: number;

  constructor(readonly owner: string, openingBalance: number, readonly creditLimit = 0) {
    this._balance = openingBalance;
  }

  get balance(): number {
    return this._balance;
  }

  deposit(amount: number): void {
    assertPositiveAmount(amount);
    this._balance += amount;
  }

  withdraw(amount: number): WithdrawalResult {
    assertPositiveAmount(amount);
    if (amount > this.availableFunds()) {
      return { ok: false, reason: this.declineReason(amount) };
    }
    this._balance -= amount;
    this.onWithdrawn(amount);
    return { ok: true, newBalance: this._balance };
  }

  abstract availableFunds(): number;

  /** Hook: explain a decline in the subtype's own words. */
  protected declineReason(amount: number): string {
    return `${this.owner}: ${amount.toFixed(2)} exceeds available funds ${
      this.availableFunds().toFixed(2)
    }`;
  }

  /** Hook: bookkeeping after a successful withdrawal. */
  protected onWithdrawn(_amount: number): void {}
}
