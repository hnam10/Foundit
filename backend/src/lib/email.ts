import nodemailer from 'nodemailer';

// In development, Ethereal (fake SMTP) is used to catch outgoing emails without actually sending them.
// In production, set real SMTP credentials in .env to send actual emails.

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT ?? '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Foundit" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verify your Foundit account',
    html: `
      <p>Thanks for signing up!</p>
      <p>Click the link below to verify your email. This link expires in an hour.</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `,
  });
}
