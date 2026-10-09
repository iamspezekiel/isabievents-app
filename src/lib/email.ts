/**
 * Transactional email (SMTP via nodemailer) — server only.
 *
 * Configure in .env:
 *   SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL
 *
 * When SMTP is not configured every send is a logged no-op, so the app never
 * breaks in demo mode.
 */
import nodemailer, {type Transporter} from 'nodemailer';

export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || 'isabideveloper@gmail.com';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS},
    });
  }
  return transporter;
}

function fromAddress(): string {
  return process.env.SMTP_FROM || `IsabiEvents <${process.env.SMTP_USER || 'no-reply@isabievents.ng'}>`;
}

const PRIMARY = '#7E7CFF';

/** Shared branded HTML wrapper. */
function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e6ef;">
        <tr><td style="background:${PRIMARY};padding:24px 32px;">
          <span style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">Isabi<span style="opacity:.75;">Events</span></span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:#16161d;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e6e6ef;">
          <p style="margin:0;font-size:12px;color:#8a8a99;">IsabiEvents — Nigeria's premier ticket marketplace · <a href="https://isabievents.ng" style="color:${PRIMARY};">isabievents.ng</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3d3d4d;">${text}</p>`;

async function send(opts: {to: string | string[]; subject: string; html: string; text?: string}): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) {
    console.warn(`[email] SMTP not configured — skipped "${opts.subject}" to ${opts.to}`);
    return false;
  }
  try {
    await tx.sendMail({from: fromAddress(), to: opts.to, subject: opts.subject, html: opts.html, text: opts.text});
    console.log(`[email] sent "${opts.subject}" to ${opts.to}`);
    return true;
  } catch (err) {
    console.warn(`[email] failed to send "${opts.subject}":`, err instanceof Error ? err.message : err);
    return false;
  }
}

const money = (amount: number, currency: 'NGN' | 'USD') =>
  currency === 'USD' ? `$${amount.toFixed(2)}` : `₦${amount.toLocaleString()}`;

/** Sent after account creation (main signup, checkout signup, or Google). */
export async function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
  return send({
    to: email,
    subject: 'Welcome to IsabiEvents! 🎟️',
    html: layout(
      `Welcome${name ? `, ${name}` : ''}!`,
      p(`Your IsabiEvents account is ready. Discover the best Nigerian concerts, festivals, tech summits and more — and check out in seconds with our secure Bachs checkout.`) +
        `<a href="${process.env.APP_BASE_URL || 'https://isabievents.ng'}/discover" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">Discover Events</a>` +
        `<p style="margin:18px 0 0;font-size:12px;color:#8a8a99;">If you did not create this account, you can safely ignore this email.</p>`
    ),
    text: 'Welcome to IsabiEvents! Your account is ready.',
  });
}

/** Sent by the Bachs webhook when an order is paid — includes QR ticket codes. */
export async function sendPaymentConfirmationEmail(opts: {
  name: string;
  email: string;
  eventTitle: string;
  quantity: number;
  amount: number;
  currency: 'NGN' | 'USD';
  orderId: string;
  tickets: string[];
}): Promise<boolean> {
  const ticketRows = opts.tickets
    .map(
      (code) =>
        `<tr><td style="padding:10px 14px;border:1px dashed #c9c9d8;border-radius:8px;font-family:monospace;font-size:13px;color:#16161d;">${code}</td></tr>`
    )
    .join('');
  const sent = await send({
    to: opts.email,
    subject: `Payment confirmed — ${opts.eventTitle} 🎉`,
    html: layout(
      'Payment Successful!',
      p(`Thank you${opts.name ? `, ${opts.name}` : ''}! Your payment for <strong>${opts.eventTitle}</strong> was confirmed.`) +
        p(`<strong>Amount:</strong> ${money(opts.amount, opts.currency)} · <strong>Tickets:</strong> ${opts.quantity} · <strong>Order:</strong> ${opts.orderId}`) +
        `<p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#16161d;">Your QR ticket codes (also in your wallet):</p>` +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px;">${ticketRows}</table>` +
        p('Show any code at the gate — entry is scanned and verified instantly.')
    ),
    text: `Payment confirmed for ${opts.eventTitle}. Order ${opts.orderId}. Tickets: ${opts.tickets.join(', ')}`,
  });
  // Admin visibility of every sale.
  await send({
    to: ADMIN_EMAIL(),
    subject: `💸 New sale — ${opts.eventTitle} (${money(opts.amount, opts.currency)})`,
    html: layout(
      'New ticket sale',
      p(`<strong>${opts.name || 'Guest'}</strong> (${opts.email}) purchased <strong>${opts.quantity}</strong> ticket(s) for <strong>${opts.eventTitle}</strong>.`) +
        p(`Amount: <strong>${money(opts.amount, opts.currency)}</strong> · Order: <code>${opts.orderId}</code> · Payment via Bachs.`)
    ),
    text: `New sale: ${opts.email} bought ${opts.quantity}x ${opts.eventTitle} for ${money(opts.amount, opts.currency)}.`,
  });
  return sent;
}

/** Contact-us form → forwarded to the admin inbox. */
export async function sendContactEmail(opts: {name: string; email: string; subject?: string; message: string}): Promise<boolean> {
  return send({
    to: ADMIN_EMAIL(),
    subject: `📨 Contact form: ${opts.subject || 'New message'} (from ${opts.name})`,
    html: layout(
      'New contact message',
      p(`<strong>From:</strong> ${opts.name} &lt;${opts.email}&gt;`) +
        (opts.subject ? p(`<strong>Subject:</strong> ${opts.subject}`) : '') +
        `<div style="background:#f6f6fa;border-radius:12px;padding:16px;font-size:14px;line-height:1.6;color:#3d3d4d;white-space:pre-wrap;">${opts.message.replace(/</g, '&lt;')}</div>` +
        `<p style="margin:14px 0 0;font-size:12px;color:#8a8a99;">Reply directly to this email to respond to ${opts.name}.</p>`
    ),
    text: `Contact from ${opts.name} <${opts.email}>: ${opts.message}`,
  });
}

/** Newsletter subscribe → admin notification + subscriber confirmation. */
export async function sendSubscribeEmail(subscriberEmail: string): Promise<boolean> {
  await send({
    to: ADMIN_EMAIL(),
    subject: `🆕 New newsletter subscriber — ${subscriberEmail}`,
    html: layout(
      'New newsletter subscriber',
      p(`<strong>${subscriberEmail}</strong> just subscribed to the IsabiEvents newsletter from the website footer.`)
    ),
    text: `New newsletter subscriber: ${subscriberEmail}`,
  });
  return send({
    to: subscriberEmail,
    subject: "You're on the list! 🎶",
    html: layout(
      "You're subscribed!",
      p(`Thanks for subscribing to the IsabiEvents newsletter — you'll get first access to Nigerian concerts, festivals, and tech summits.`) +
        `<a href="${process.env.APP_BASE_URL || 'https://isabievents.ng'}/discover" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">Browse Events</a>`
    ),
    text: 'Thanks for subscribing to the IsabiEvents newsletter!',
  });
}

/** New-user alert to admin (signup of any kind). */
export async function sendAdminNewUserEmail(opts: {name: string; email: string; role: string; method: string}): Promise<boolean> {
  return send({
    to: ADMIN_EMAIL(),
    subject: `👋 New ${opts.role} signup — ${opts.email}`,
    html: layout(
      'New account created',
      p(`<strong>${opts.name || 'Unnamed user'}</strong> (${opts.email}) created a <strong>${opts.role}</strong> account via ${opts.method}.`)
    ),
    text: `New ${opts.role} signup: ${opts.email} via ${opts.method}`,
  });
}

