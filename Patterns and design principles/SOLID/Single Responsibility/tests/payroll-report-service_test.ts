import { assertEquals } from "@std/assert";
import { InMemoryEmployeeRepository } from "../src/good/employee-repository.ts";
import { PayrollCalculator } from "../src/good/payroll-calculator.ts";
import { PayrollReportService } from "../src/good/payroll-report-service.ts";
import { PlainTextReportFormatter } from "../src/good/report-formatter.ts";
import { RecordingReportNotifier } from "../src/good/report-notifier.ts";
import { InMemoryReportStore } from "../src/good/report-store.ts";
import { SAMPLE_EMPLOYEES } from "../src/shared/employee.ts";

/**
 * Because every responsibility lives behind its own interface, the whole workflow
 * can be tested without touching the file system or any real delivery channel.
 * Try doing that with `PayrollReportManager` in src/bad.
 */
Deno.test("service wires the steps together using injected collaborators", async () => {
  const store = new InMemoryReportStore();
  const notifier = new RecordingReportNotifier();
  const service = new PayrollReportService(
    new InMemoryEmployeeRepository(SAMPLE_EMPLOYEES),
    new PayrollCalculator(),
    new PlainTextReportFormatter(),
    store,
    notifier,
  );

  const locator = await service.run({ recipient: "finance@example.com", baseFileName: "payroll" });

  assertEquals(locator, "memory://payroll.txt");
  assertEquals(store.saved.has("payroll.txt"), true);
  assertEquals(notifier.sent, [
    {
      recipient: "finance@example.com",
      subject: `Payroll report (${SAMPLE_EMPLOYEES.length} employees)`,
      attachmentLocator: "memory://payroll.txt",
    },
  ]);
});

Deno.test("repository excludes employees with zero hours", async () => {
  const repo = new InMemoryEmployeeRepository([
    ...SAMPLE_EMPLOYEES,
    { id: 99, name: "On Leave", department: "HR", hoursWorked: 0, hourlyRate: 50 },
  ]);
  const active = await repo.findActive();
  assertEquals(active.length, SAMPLE_EMPLOYEES.length);
});
