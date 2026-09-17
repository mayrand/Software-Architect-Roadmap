import type { Employee } from "../shared/employee.ts";

export interface PayrollLine {
  readonly employee: Employee;
  readonly regularHours: number;
  readonly overtimeHours: number;
  readonly grossPay: number;
}

export interface PayrollSummary {
  readonly lines: readonly PayrollLine[];
  readonly grandTotal: number;
}

/**
 * GOOD - Responsibility: business rules for pay.
 * The only reason to change this file is "Accounting changed how pay is computed".
 * Pure functions: no I/O, trivially unit-testable.
 */
export class PayrollCalculator {
  constructor(
    private readonly regularHoursCap = 160,
    private readonly overtimeMultiplier = 1.5,
  ) {}

  calculateLine(employee: Employee): PayrollLine {
    const regularHours = Math.min(employee.hoursWorked, this.regularHoursCap);
    const overtimeHours = Math.max(employee.hoursWorked - this.regularHoursCap, 0);
    const grossPay = regularHours * employee.hourlyRate +
      overtimeHours * employee.hourlyRate * this.overtimeMultiplier;
    return { employee, regularHours, overtimeHours, grossPay };
  }

  summarize(employees: readonly Employee[]): PayrollSummary {
    const lines = employees.map((e) => this.calculateLine(e));
    const grandTotal = lines.reduce((sum, l) => sum + l.grossPay, 0);
    return { lines, grandTotal };
  }
}
