/**
 * Build a responsive HTML email for an awareness-day communication.
 *
 * Uses inline CSS for maximum email-client compatibility.
 */
export function buildEmailHtml(params: {
  subject: string;
  body: string;
  subscriberName: string;
  unsubscribeUrl: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageCredit?: string | null;
}): string {
  const { subject, body, subscriberName, unsubscribeUrl, imageUrl, imageAlt, imageCredit } = params;

  const greeting = subscriberName
    ? `Hi ${subscriberName},`
    : "Hi there,";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Main card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0071e3 0%,#34c759 100%);padding:32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:14px;font-weight:600;color:rgba(255,255,255,0.85);text-transform:uppercase;letter-spacing:1.5px;">
                      Inclusion &amp; Diversity
                    </h1>
                    <h2 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
                      ${escapeHtml(subject)}
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${imageUrl ? `<!-- Hero image -->
          <tr>
            <td style="padding:0;font-size:0;line-height:0;">
              <img
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(imageAlt ?? '')}"
                width="600"
                style="display:block;width:100%;height:auto;max-height:250px;object-fit:cover;"
              />
            </td>
          </tr>
          ${imageCredit ? `<tr>
            <td style="padding:4px 40px 0;text-align:right;">
              <p style="margin:0;font-size:10px;color:#86868b;">${escapeHtml(imageCredit)}</p>
            </td>
          </tr>` : ''}` : ''}

          <!-- Body content -->
          <tr>
            <td style="padding:32px 40px;font-size:15px;line-height:1.65;color:#1d1d1f;">
              <p style="margin:0 0 16px;color:#6e6e73;font-size:14px;">${escapeHtml(greeting)}</p>
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0f0f0;font-size:12px;color:#86868b;line-height:1.5;">
              <p style="margin:0 0 8px;">
                You received this because you are subscribed to I&amp;D Awareness updates.
              </p>
              <p style="margin:0;">
                <a href="${escapeHtml(unsubscribeUrl)}" style="color:#0071e3;text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="#" style="color:#0071e3;text-decoration:underline;">Manage preferences</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Main card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
