import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || 'noreply@gaanavykhari.com';

    const { error } = await resend.emails.send({
      from: `Gaanavykhari <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
