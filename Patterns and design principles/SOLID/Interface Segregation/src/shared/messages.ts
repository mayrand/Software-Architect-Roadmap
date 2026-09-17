/** Domain model shared by both the good and the bad example. */
export interface Attachment {
  readonly fileName: string;
  readonly sizeKb: number;
}

export interface Reply {
  readonly from: string;
  readonly text: string;
}

export type DeliveryStatus = "queued" | "delivered" | "failed";

export class NotSupportedError extends Error {
  constructor(channel: string, operation: string) {
    super(`${channel} does not support ${operation}`);
    this.name = "NotSupportedError";
  }
}

let counter = 0;
export function nextMessageId(prefix: string): string {
  counter++;
  return `${prefix}-${counter}`;
}
