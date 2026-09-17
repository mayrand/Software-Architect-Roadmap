import type { Employee } from "../shared/employee.ts";

/**
 * BAD: Single Responsibility Principle violated.
 *
 * `PayrollReportManager` is a "god class". It has at least five reasons to change:
 *
 *   1. Data access      - where employees come from (in-memory today, a DB tomorrow).
 *   2. Business rules   - how gross pay and overtime are calculated.
 *   3. Presentation     - how the report is rendered (plain text today, HTML/CSV tomorrow).
 *   4. Persistence      - where the report is stored (file today, S3 tomorrow).
 *   5. Notification     - how the report is delivered (console "email" today, SMTP tomorrow).
 *
 * Symptoms this causes:
 *   - Accounting changing the overtime rule forces a redeploy of the code that sends email.
 *   - Testing the pay calculation requires the file system and a mail transport.
 *   - Five different teams edit the same file and collide in code review.
 *   - You cannot reuse the formatter or the calculation anywhere else.
 */
export class PayrollReportManager {
  private readonly employees: Employee[];
  private readonly outputDir: string;

  constructor(employees: readonly Employee[], outputDir: string) {
    this.employees = [...employees];
    this.outputDir = outputDir;
  }

  /** One method that does everything, in a fixed order, with no seams. */
  async run(): Promise<void> {
    // --- (1) data access: filter / sort straight from the raw array
    const rows = this.employees
      .filter((e) => e.hoursWorked > 0)
      .sort((a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name));

    // --- (2) business rules: overtime math inlined into the loop
    let grandTotal = 0;
    const lines: string[] = [];
    for (const e of rows) {
      const regularHours = Math.min(e.hoursWorked, 160);
      const overtimeHours = Math.max(e.hoursWorked - 160, 0);
      const gross = regularHours * e.hourlyRate + overtimeHours * e.hourlyRate * 1.5;
      grandTotal += gross;

      // --- (3) presentation: string formatting mixed with the math above
      const hours = String(e.hoursWorked).padStart(4);
      const money = gross.toFixed(2).padStart(10);
      lines.push(`${e.department.padEnd(12)} ${e.name.padEnd(18)} ${hours}h  $${money}`);
    }
    const report = [
      "PAYROLL REPORT",
      "-".repeat(50),
      ...lines,
      "-".repeat(50),
      `TOTAL ${"".padEnd(37)} $${grandTotal.toFixed(2).padStart(10)}`,
    ].join("\n");

    // --- (4) persistence: direct file-system calls
    await Deno.mkdir(this.outputDir, { recursive: true });
    const path = `${this.outputDir}/payroll-bad.txt`;
    await Deno.writeTextFile(path, report);

    // --- (5) notification: "email" hard-wired to console.log
    console.log(`[BAD] To: finance@example.com`);
    console.log(`[BAD] Subject: Payroll report (${rows.length} employees)`);
    console.log(`[BAD] Attachment: ${path}`);
    console.log(report);
  }
}
