import type { PayrollSummary } from "./payroll-calculator.ts";

/**
 * GOOD - Responsibility: presentation.
 * Changing the layout, or adding CSV/HTML output, only touches this file.
 */
export interface ReportFormatter {
  readonly fileExtension: string;
  format(summary: PayrollSummary): string;
}

export class PlainTextReportFormatter implements ReportFormatter {
  readonly fileExtension = "txt";

  format(summary: PayrollSummary): string {
    const rows = summary.lines.map(({ employee: e, grossPay }) => {
      const hours = String(e.hoursWorked).padStart(4);
      const money = grossPay.toFixed(2).padStart(10);
      return `${e.department.padEnd(12)} ${e.name.padEnd(18)} ${hours}h  $${money}`;
    });
    return [
      "PAYROLL REPORT",
      "-".repeat(50),
      ...rows,
      "-".repeat(50),
      `TOTAL ${"".padEnd(37)} $${summary.grandTotal.toFixed(2).padStart(10)}`,
    ].join("\n");
  }
}

export class CsvReportFormatter implements ReportFormatter {
  readonly fileExtension = "csv";

  format(summary: PayrollSummary): string {
    const header = "department,name,hours,regular_hours,overtime_hours,gross_pay";
    const rows = summary.lines.map((l) =>
      [
        l.employee.department,
        l.employee.name,
        l.employee.hoursWorked,
        l.regularHours,
        l.overtimeHours,
        l.grossPay.toFixed(2),
      ].join(",")
    );
    return [header, ...rows, `,,,,TOTAL,${summary.grandTotal.toFixed(2)}`].join("\n");
  }
}
