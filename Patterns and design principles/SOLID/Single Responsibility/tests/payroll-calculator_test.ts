import { assertEquals } from "@std/assert";
import { PayrollCalculator } from "../src/good/payroll-calculator.ts";
import type { Employee } from "../src/shared/employee.ts";

const base: Employee = { id: 1, name: "Test", department: "QA", hoursWorked: 0, hourlyRate: 10 };

Deno.test("no overtime below the cap", () => {
  const line = new PayrollCalculator().calculateLine({ ...base, hoursWorked: 100 });
  assertEquals(line.regularHours, 100);
  assertEquals(line.overtimeHours, 0);
  assertEquals(line.grossPay, 1000);
});

Deno.test("overtime paid at 1.5x above the cap", () => {
  const line = new PayrollCalculator().calculateLine({ ...base, hoursWorked: 170 });
  assertEquals(line.regularHours, 160);
  assertEquals(line.overtimeHours, 10);
  assertEquals(line.grossPay, 160 * 10 + 10 * 10 * 1.5);
});

Deno.test("cap and multiplier are configurable", () => {
  const line = new PayrollCalculator(40, 2).calculateLine({ ...base, hoursWorked: 50 });
  assertEquals(line.grossPay, 40 * 10 + 10 * 10 * 2);
});

Deno.test("summarize totals all lines", () => {
  const summary = new PayrollCalculator().summarize([
    { ...base, hoursWorked: 10 },
    { ...base, id: 2, hoursWorked: 20 },
  ]);
  assertEquals(summary.lines.length, 2);
  assertEquals(summary.grandTotal, 300);
});
