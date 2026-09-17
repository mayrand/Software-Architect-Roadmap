import { assertEquals, assertStringIncludes } from "@std/assert";
import { PayrollCalculator } from "../src/good/payroll-calculator.ts";
import { CsvReportFormatter, PlainTextReportFormatter } from "../src/good/report-formatter.ts";
import { SAMPLE_EMPLOYEES } from "../src/shared/employee.ts";

const summary = new PayrollCalculator().summarize(SAMPLE_EMPLOYEES);

Deno.test("plain text formatter renders header, rows and total", () => {
  const text = new PlainTextReportFormatter().format(summary);
  const lines = text.split("\n");
  assertEquals(lines[0], "PAYROLL REPORT");
  assertEquals(lines.length, 2 + SAMPLE_EMPLOYEES.length + 2);
  assertStringIncludes(lines.at(-1)!, summary.grandTotal.toFixed(2));
});

Deno.test("csv formatter renders one row per employee plus header and total", () => {
  const csv = new CsvReportFormatter().format(summary);
  const lines = csv.split("\n");
  assertEquals(lines[0], "department,name,hours,regular_hours,overtime_hours,gross_pay");
  assertEquals(lines.length, 1 + SAMPLE_EMPLOYEES.length + 1);
  assertStringIncludes(lines.at(-1)!, summary.grandTotal.toFixed(2));
});
