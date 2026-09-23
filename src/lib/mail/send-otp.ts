export type MailProvider = "resend" | "console";

export function getMailProvider(): MailProvider {
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  return "console";
}

function otpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#161616;border:1px solid #2a2a2a;border-radius:16px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;color:#a78bfa;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Envision</p>
                <h1 style="margin:0 0 12px;color:#ffffff;font-size:22px;line-height:1.3;">Your voting code</h1>
                <p style="margin:0 0 24px;color:#a3a3a3;font-size:14px;line-height:1.5;">
                  Use this 6-digit code to enter the Envision UI competition gallery. It expires in 10 minutes.
                </p>
                <p style="margin:0 0 24px;text-align:center;font-size:32px;letter-spacing:0.35em;font-weight:700;color:#ffffff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
                  ${code}
                </p>
                <p style="margin:0;color:#737373;font-size:12px;line-height:1.5;">
                  If you did not request this code, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function otpEmailText(code: string): string {
  return `Your Envision voting code is ${code}.

It expires in 10 minutes. If you did not request this, ignore the email.`;
}

async function sendWithResend(to: string, code: string): Promise<{ error?: string }> {
  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Envision <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your Envision voting code",
      html: otpEmailHtml(code),
      text: otpEmailText(code),
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    return { error: body.message ?? body.error ?? "Failed to send email" };
  }

  return {};
}

export async function sendOtpEmail(
  to: string,
  code: string,
): Promise<{ error?: string; provider: MailProvider }> {
  const provider = getMailProvider();

  if (provider === "resend") {
    const result = await sendWithResend(to, code);
    return { ...result, provider };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      error: "Mailer is not configured. Set RESEND_API_KEY.",
      provider,
    };
  }

  console.info(`[otp:${provider}] ${to} → ${code}`);
  return { provider };
}
