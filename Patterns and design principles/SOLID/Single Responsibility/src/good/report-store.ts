/**
 * GOOD - Responsibility: persistence.
 * Only changes when the storage target changes (file -> S3 -> database blob).
 */
export interface ReportStore {
  /** Persists the content and returns a locator (path, URL, key...) for it. */
  save(fileName: string, content: string): Promise<string>;
}

export class FileSystemReportStore implements ReportStore {
  constructor(private readonly directory: string) {}

  async save(fileName: string, content: string): Promise<string> {
    await Deno.mkdir(this.directory, { recursive: true });
    const path = `${this.directory}/${fileName}`;
    await Deno.writeTextFile(path, content);
    return path;
  }
}

/** Handy for tests and dry runs: nothing touches the disk. */
export class InMemoryReportStore implements ReportStore {
  readonly saved = new Map<string, string>();

  save(fileName: string, content: string): Promise<string> {
    this.saved.set(fileName, content);
    return Promise.resolve(`memory://${fileName}`);
  }
}
