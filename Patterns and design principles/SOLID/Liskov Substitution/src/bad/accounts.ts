import { assertPositiveAmount } from "../shared/money.ts";

export class InsufficientFundsError extends Error {
  constructor(owner: string, requested: number, available: number) {
    super(`${owner}: cannot withdraw ${requested}, only ${available} available`);
    this.name = "InsufficientFundsError";
  }
}

/**
 * BAD: Liskov Substitution Principle violated.
 *
 * `Account` publishes a contract in its doc comments. Three subclasses below compile perfectly,
 * pass `instanceof Account`, and each breaks that contract in a different way. Any code written
 * against `Account` is therefore wrong the moment one of them shows up in a list.
 */
export class Account {
  protected _balance: number;

  constructor(readonly owner: string, openingBalance = 0) {
    this._balance = openingBalance;
  }

  get balance(): number {
    return this._balance;
  }

  deposit(amount: number): void {
    assertPositiveAmount(amount);
    this._balance += amount;
  }

  /**
   * Contract:
   *   pre   amount > 0
   *   post  balance decreased by exactly `amount`
   *   inv   balance is never negative
   *   throws InsufficientFundsError when amount > balance, and nothing else
   */
  withdraw(amount: number): void {
    assertPositiveAmount(amount);
    if (amount > this._balance) {
      throw new InsufficientFundsError(this.owner, amount, this._balance);
    }
    this._balance -= amount;
  }
}

/**
 * Violation 1 - STRENGTHENED PRECONDITION.
 * The base type says "any positive amount up to the balance". This subtype adds a hidden extra
 * condition ("...and only three times a month") and signals it with an exception type the
 * caller was never told about.
 */
export class SavingsAccount extends Account {
  private withdrawalsThisMonth = 0;

  constructor(owner: string, openingBalance = 0, private readonly maxWithdrawals = 3) {
    super(owner, openingBalance);
  }

  override withdraw(amount: number): void {
    if (this.withdrawalsThisMonth >= this.maxWithdrawals) {
      throw new Error(
        `${this.owner}: savings accounts allow ${this.maxWithdrawals} withdrawals per month`,
      );
    }
    super.withdraw(amount);
    this.withdrawalsThisMonth++;
  }
}

/**
 * Violation 2 - BROKEN INVARIANT.
 * The base type promises "balance is never negative". This subtype quietly lets the balance go
 * below zero. Nothing throws; every caller that relied on the invariant is now silently wrong.
 */
export class OverdraftAccount extends Account {
  constructor(owner: string, openingBalance = 0, private readonly creditLimit = 0) {
    super(owner, openingBalance);
  }

  override withdraw(amount: number): void {
    assertPositiveAmount(amount);
    if (amount > this._balance + this.creditLimit) {
      throw new InsufficientFundsError(this.owner, amount, this._balance + this.creditLimit);
    }
    this._balance -= amount; // may go negative: invariant broken
  }
}

/**
 * Violation 3 - REFUSED OPERATION.
 * A term deposit cannot be withdrawn from, so this override always throws. The class is an
 * `Account` in name only. "IS-A" in the code, "IS-NOT" in behavior.
 */
export class FixedTermDeposit extends Account {
  constructor(owner: string, openingBalance: number, readonly maturesOn: string) {
    super(owner, openingBalance);
  }

  override withdraw(_amount: number): never {
    throw new Error(`${this.owner}: funds are locked until ${this.maturesOn}`);
  }
}
