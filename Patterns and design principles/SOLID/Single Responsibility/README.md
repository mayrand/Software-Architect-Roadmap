# SOLID catalog - Single Responsibility Principle

A small Deno app that shows the **same feature built twice**: once violating the Single
Responsibility Principle (SRP) and once respecting it. Both variants generate a payroll report from
a list of employees, save it to disk, and "email" it to the console, so the output is identical and
only the design differs.

> A class should have one, and only one, reason to change. - Robert C. Martin

## Run

```bash
deno task start   # run both demos, writes reports to ./out
deno task test    # unit tests (only the good design is testable in isolation)
deno task check   # fmt + lint + type-check
```

## Layout

```
main.ts                          composition root: wires and runs both demos
src/shared/employee.ts           domain model + sample data used by both
src/bad/payroll-report-manager.ts   one class, five responsibilities
src/good/
  employee-repository.ts         data access        (EmployeeRepository)
  payroll-calculator.ts          business rules     (PayrollCalculator)
  report-formatter.ts            presentation       (ReportFormatter: text, CSV)
  report-store.ts                persistence        (ReportStore: file system, in-memory)
  report-notifier.ts             delivery           (ReportNotifier: console, recording)
  payroll-report-service.ts      orchestration      (PayrollReportService)
tests/                           tests for the good design
```

## The bad example

`PayrollReportManager.run()` loads data, computes overtime, formats text, writes a file and sends a
notification in one method. It therefore has five different stakeholders who can each force a change
to it:

| Stakeholder wants to...                      | ...but must edit the same class that |
| -------------------------------------------- | ------------------------------------ |
| Accounting: change the overtime multiplier   | sends email                          |
| Design: switch the report to HTML            | computes pay                         |
| Ops: store reports in S3 instead of a folder | filters employees                    |
| Marketing: send via Slack instead of email   | formats columns                      |
| Data team: read employees from a database    | writes files                         |

Consequences: the pay math cannot be unit-tested without a file system, nothing is reusable, and
unrelated changes collide in the same file.

## The good example

Each concern lives in its own class behind a small interface, and `PayrollReportService` only knows
the _order_ of the steps. Benefits you can see in this repo:

- `tests/payroll-calculator_test.ts` tests pay rules with no I/O at all.
- `tests/payroll-report-service_test.ts` tests the whole workflow with an in-memory store and a
  recording notifier, no disk or network.
- `main.ts` produces a CSV report by swapping **only** the formatter. The other four classes are
  untouched.

## Heuristics for spotting SRP violations

- The class name contains `Manager`, `Handler`, `Processor`, or `Util`.
- You describe the class with "and": "it calculates pay _and_ saves the report".
- A change request from one department touches code that another department owns.
- Unit tests need the file system, network, or clock to test pure logic.
