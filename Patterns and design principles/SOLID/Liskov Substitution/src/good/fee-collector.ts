import type { Account } from "./account.ts";

export interface WaivedFee {
  readonly owner: string;
  readonly reason: string;
}

export interface FeeReport {
  readonly charged: string[];
  readonly waived: WaivedFee[];
}

/**
 * GOOD - the client is written once, against the contract, and stays that way.
 * No instanceof, no try/catch, no knowledge of which account types exist. A fourth account type
 * added next year works here unchanged, provided it passes the contract tests.
 */
export function collectMonthlyFee(accounts: readonly Account[], fee: number): FeeReport {
  const charged: string[] = [];
  const waived: WaivedFee[] = [];
  for (const account of accounts) {
    const result = account.withdraw(fee);
    if (result.ok) {
      charged.push(account.owner);
    } else {
      waived.push({ owner: account.owner, reason: result.reason });
    }
  }
  return { charged, waived };
}

/** Audit against the DECLARED invariant, so overdrafts within their limit are not false alarms. */
export function auditLedger(accounts: readonly Account[]): string[] {
  return accounts
    .filter((a) => a.balance < -a.creditLimit)
    .map((a) =>
      `${a.owner}: balance ${a.balance.toFixed(2)} below limit -${a.creditLimit.toFixed(2)}`
    );
}
