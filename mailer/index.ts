import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { config } from "@/lib/config";

function createSesClient(): SESClient {
  return new SESClient({
    region: config.AWS_REGION ?? "eu-west-1",
    credentials:
      config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

/**
 * Send a single HTML email via AWS SES.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<void> {
  const ses = createSesClient();

  const fromEmail = config.SES_FROM_EMAIL ?? "noreply@company.com";

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [params.to],
    },
    Message: {
      Subject: { Data: params.subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: params.htmlBody, Charset: "UTF-8" },
      },
    },
  });

  await ses.send(command);
}

/**
 * Send an email to multiple recipients, batching one-by-one through SES.
 *
 * Returns the count of successfully sent and failed emails.
 */
export async function sendBulk(params: {
  recipients: { email: string; name?: string }[];
  subject: string;
  htmlBody: string;
}): Promise<{ sent: number; failed: number }> {
  const { recipients, subject, htmlBody } = params;

  let sent = 0;
  let failed = 0;

  // SES doesn't have a native bulk-send for individual personalisation,
  // so we send one-by-one with a small concurrency batch.
  const BATCH_SIZE = 10;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((recipient) =>
        sendEmail({
          to: recipient.email,
          subject,
          htmlBody,
        }),
      ),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
        console.error(
          `Failed to send to ${batch[results.indexOf(result)]?.email}:`,
          result.reason,
        );
      }
    }
  }

  return { sent, failed };
}
