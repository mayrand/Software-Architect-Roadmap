import { networkRoundTrip } from "./latency.ts";

/** Simulated database driver. Rows are kept in memory so demos and tests can inspect them. */
export class PostgresClient {
  readonly rows: Array<readonly unknown[]> = [];

  constructor(private readonly connectionString: string) {}

  async query(sql: string, params: readonly unknown[]): Promise<{ rowCount: number }> {
    await networkRoundTrip();
    console.log(`   [postgres ${this.connectionString}] ${sql.split(" (")[0]} ${JSON.stringify(params)}`);
    this.rows.push(params);
    return { rowCount: 1 };
  }
}
