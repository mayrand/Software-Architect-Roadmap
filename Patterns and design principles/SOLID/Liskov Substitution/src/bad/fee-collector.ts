import { Account, FixedTermDeposit, OverdraftAccount, SavingsAccount } from "./accounts.ts";

export interface FeeReport {
  readonly charged: string[];
  readonly waived: string[];
}

/**
 * The client as it was first written: against the `Account` contract and nothing else.
 * By the contract this code is CORRECT. The only documented failure case is "not enough
 * balance", and it is checked up front, so `withdraw` should never throw here.
 */
export function collectMonthlyFeeNaive(accounts: readonly Account[], fee: number): FeeReport {
  const charged: string[] = [];
  const waived: string[] = [];
  for (const account of accounts) {
    if (account.balance < fee) {
      waived.push(account.owner); // trusts "balance is never negative": an overdraft customer
      continue; //                    with balance 2 and a 200 credit line is wrongly waived
    }
    account.withdraw(fee); // trusts the contract: crashes on SavingsAccount / FixedTermDeposit
    charged.push(account.owner);
  }
  return { charged, waived };
}

/**
 * The same client after three production incidents. It now has to KNOW every subclass.
 * Each `instanceof` is a scar left by a subtype that lied about being an `Account`.
 * Adding a fourth subclass means editing this function again (OCP is now violated too).
 */
export function collectMonthlyFeeDefensive(accounts: readonly Account[], fee: number): FeeReport {
  const charged: string[] = [];
  const waived: string[] = [];
  for (const account of accounts) {
    if (account instanceof FixedTermDeposit) { // incident #1: crash at month end
      waived.push(account.owner);
      continue;
    }
    if (account instanceof SavingsAccount) { // incident #2: crash for customers with 3 withdrawals
      try {
        account.withdraw(fee);
        charged.push(account.owner);
      } catch {
        waived.push(account.owner);
      }
      continue;
    }
    if (account instanceof OverdraftAccount) { // incident #3: overdraft customers never charged
      account.withdraw(fee);
      charged.push(account.owner);
      continue;
    }
    if (account.balance < fee) {
      waived.push(account.owner);
      continue;
    }
    account.withdraw(fee);
    charged.push(account.owner);
  }
  return { charged, waived };
}

/** Month-end audit written against the base-class invariant "balance is never negative". */
export function auditLedger(accounts: readonly Account[]): string[] {
  return accounts
    .filter((a) => a.balance < 0)
    .map((a) => `${a.owner}: negative balance ${a.balance.toFixed(2)} - ledger corrupt?`);
}
