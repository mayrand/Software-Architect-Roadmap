import type { Employee } from "../shared/employee.ts";

/**
 * GOOD - Responsibility: where employees come from.
 * Swap the implementation for a database or HTTP client without touching anything else.
 */
export interface EmployeeRepository {
  findActive(): Promise<readonly Employee[]>;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
  constructor(private readonly employees: readonly Employee[]) {}

  findActive(): Promise<readonly Employee[]> {
    const active = this.employees
      .filter((e) => e.hoursWorked > 0)
      .toSorted((a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name));
    return Promise.resolve(active);
  }
}
