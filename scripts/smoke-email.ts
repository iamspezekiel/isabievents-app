/** Temporary smoke test: verifies outbound SMTP. Run: npx tsx scripts/smoke-email.ts */
import 'dotenv/config';
import nodemailer from 'nodemailer';

async function main() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const;
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error('✗ Missing env:', missing.join(', '));
    process.exit(1);
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS!},
  });

  console.log(`Connecting to ${process.env.SMTP_HOST}:${port}…`);
  await transporter.verify();
  console.log('✓ SMTP connection + auth OK');

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: 'IsabiEvents email smoke test',
    text: 'If you received this message, outbound email from IsabiEvents is working.',
    html: '<p>If you received this message, <strong>outbound email from IsabiEvents is working</strong>.</p>',
  });
  console.log('✓ Email sent — messageId:', info.messageId);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Email failed:', err?.message || err);
    process.exit(1);
  });
