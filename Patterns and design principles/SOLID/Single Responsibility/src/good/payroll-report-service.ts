import type { EmployeeRepository } from "./employee-repository.ts";
import type { PayrollCalculator } from "./payroll-calculator.ts";
import type { ReportFormatter } from "./report-formatter.ts";
import type { ReportNotifier } from "./report-notifier.ts";
import type { ReportStore } from "./report-store.ts";

export interface PayrollReportOptions {
  readonly recipient: string;
  readonly baseFileName: string;
}

/**
 * GOOD - Responsibility: orchestration.
 * This class knows the *order* of the steps and nothing about *how* any step works.
 * Its only reason to change is "the workflow itself changed" (e.g. add an approval step).
 *
 * Every collaborator is injected, so each can be tested in isolation and swapped freely.
 */
export class PayrollReportService {
  constructor(
    private readonly repository: EmployeeRepository,
    private readonly calculator: PayrollCalculator,
    private readonly formatter: ReportFormatter,
    private readonly store: ReportStore,
    private readonly notifier: ReportNotifier,
  ) {}

  async run(options: PayrollReportOptions): Promise<string> {
    const employees = await this.repository.findActive();
    const summary = this.calculator.summarize(employees);
    const content = this.formatter.format(summary);
    const locator = await this.store.save(
      `${options.baseFileName}.${this.formatter.fileExtension}`,
      content,
    );
    await this.notifier.notify(
      options.recipient,
      `Payroll report (${employees.length} employees)`,
      content,
      locator,
    );
    return locator;
  }
}
