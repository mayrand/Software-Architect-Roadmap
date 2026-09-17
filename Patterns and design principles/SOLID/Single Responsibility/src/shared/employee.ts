/** Domain model shared by both the good and the bad example. */
export interface Employee {
  readonly id: number;
  readonly name: string;
  readonly department: string;
  readonly hoursWorked: number;
  readonly hourlyRate: number;
}

/** Deterministic sample data so both demos produce comparable output. */
export const SAMPLE_EMPLOYEES: readonly Employee[] = [
  { id: 1, name: "Ada Lovelace", department: "Engineering", hoursWorked: 160, hourlyRate: 95 },
  { id: 2, name: "Grace Hopper", department: "Engineering", hoursWorked: 172, hourlyRate: 105 },
  { id: 3, name: "Edsger Dijkstra", department: "Research", hoursWorked: 150, hourlyRate: 110 },
  { id: 4, name: "Barbara Liskov", department: "Research", hoursWorked: 168, hourlyRate: 120 },
  { id: 5, name: "Linus Torvalds", department: "Operations", hoursWorked: 180, hourlyRate: 90 },
];
