/**
 * GOOD - Responsibility: notification / delivery.
 * Only changes when the delivery channel changes (console -> SMTP -> Slack).
 */
export interface ReportNotifier {
  notify(
    recipient: string,
    subject: string,
    body: string,
    attachmentLocator: string,
  ): Promise<void>;
}

export class ConsoleReportNotifier implements ReportNotifier {
  notify(
    recipient: string,
    subject: string,
    body: string,
    attachmentLocator: string,
  ): Promise<void> {
    console.log(`[GOOD] To: ${recipient}`);
    console.log(`[GOOD] Subject: ${subject}`);
    console.log(`[GOOD] Attachment: ${attachmentLocator}`);
    console.log(body);
    return Promise.resolve();
  }
}

/** Records calls instead of printing: lets tests assert on delivery without noise. */
export class RecordingReportNotifier implements ReportNotifier {
  readonly sent: Array<{ recipient: string; subject: string; attachmentLocator: string }> = [];

  notify(
    recipient: string,
    subject: string,
    _body: string,
    attachmentLocator: string,
  ): Promise<void> {
    this.sent.push({ recipient, subject, attachmentLocator });
    return Promise.resolve();
  }
}
