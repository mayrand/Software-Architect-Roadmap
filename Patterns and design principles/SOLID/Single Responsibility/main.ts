/**
 * SOLID catalog - Single Responsibility Principle (SRP)
 *
 * Run:   deno task start
 * Test:  deno task test
 *
 * Both demos produce the same report so you can compare the *design*, not the output.
 */
import { PayrollReportManager } from "./src/bad/payroll-report-manager.ts";
import { InMemoryEmployeeRepository } from "./src/good/employee-repository.ts";
import { PayrollCalculator } from "./src/good/payroll-calculator.ts";
import { PayrollReportService } from "./src/good/payroll-report-service.ts";
import { CsvReportFormatter, PlainTextReportFormatter } from "./src/good/report-formatter.ts";
import { ConsoleReportNotifier } from "./src/good/report-notifier.ts";
import { FileSystemReportStore } from "./src/good/report-store.ts";
import { section } from "./src/shared/console-log.ts";
import { SAMPLE_EMPLOYEES } from "./src/shared/employee.ts";

const OUTPUT_DIR = "out";

async function runBadExample(): Promise<void> {
  section("BAD - one class does everything (src/bad/payroll-report-manager.ts)");
  const manager = new PayrollReportManager(SAMPLE_EMPLOYEES, OUTPUT_DIR);
  await manager.run();
}

async function runGoodExample(): Promise<void> {
  section("GOOD - one responsibility per class (src/good/*)");

  // Composition root: the *only* place that knows which concrete classes are wired together.
  const repository = new InMemoryEmployeeRepository(SAMPLE_EMPLOYEES);
  const calculator = new PayrollCalculator();
  const store = new FileSystemReportStore(OUTPUT_DIR);
  const notifier = new ConsoleReportNotifier();

  const textService = new PayrollReportService(
    repository,
    calculator,
    new PlainTextReportFormatter(),
    store,
    notifier,
  );
  await textService.run({ recipient: "finance@example.com", baseFileName: "payroll-good" });

  // Same workflow, different output format - zero changes to the other four classes.
  section("GOOD - swap only the formatter to get CSV");
  const csvService = new PayrollReportService(
    repository,
    calculator,
    new CsvReportFormatter(),
    store,
    notifier,
  );
  await csvService.run({ recipient: "finance@example.com", baseFileName: "payroll-good" });
}

if (import.meta.main) {
  await runBadExample();
  await runGoodExample();
  console.log(`\nReports written to ./${OUTPUT_DIR}/`);
}
