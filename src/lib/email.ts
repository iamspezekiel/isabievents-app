/**
 * Transactional email (SMTP via nodemailer) — server only.
 *
 * Configuration resolution (per field):
 *   1. Firestore `settings/smtp` — editable + testable from the admin dashboard
 *   2. Environment (.env): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
 *      SMTP_FROM, ADMIN_EMAIL
 *
 * When nothing is configured every send is a logged no-op, so the app never
 * breaks. Dashboard changes take effect within ~60s or immediately after
 * invalidateSmtpCache().
 */
import nodemailer, {type Transporter} from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  adminEmail: string;
}

/** True when the base env SMTP settings are present (informational flag). */
export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const envConfig = (): SmtpConfig => ({
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT || 587),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || '',
  adminEmail: process.env.ADMIN_EMAIL || 'isabideveloper@gmail.com',
});

const CONFIG_TTL = 60_000;
let cachedConfig: {at: number; cfg: SmtpConfig} | null = null;
let transporter: Transporter | null = null;
let transporterSig = '';

/** Drop the cached config (called after the admin saves new SMTP settings). */
export function invalidateSmtpCache() {
  cachedConfig = null;
  transporter = null;
  transporterSig = '';
}

/** Merged effective config: Firestore settings/smtp overrides env per field. */
export async function resolveSmtpConfig(): Promise<SmtpConfig> {
  if (cachedConfig && Date.now() - cachedConfig.at < CONFIG_TTL) return cachedConfig.cfg;
  const base = envConfig();
  let stored: Partial<SmtpConfig> = {};
  try {
    const {getAdminDb} = await import('@/lib/firebase-admin');
    const adminDb = getAdminDb();
    if (adminDb) {
      const snap = await adminDb.collection('settings').doc('smtp').get();
      if (snap.exists) {
        const d = snap.data() as Record<string, unknown>;
        stored = {
          host: typeof d.host === 'string' ? d.host : '',
          port: typeof d.port === 'number' ? d.port : 0,
          user: typeof d.user === 'string' ? d.user : '',
          pass: typeof d.pass === 'string' ? d.pass : '',
          from: typeof d.from === 'string' ? d.from : '',
          adminEmail: typeof d.adminEmail === 'string' ? d.adminEmail : '',
        };
      }
    }
  } catch {
    /* settings read failed — env fallback */
  }
  const cfg: SmtpConfig = {
    host: stored.host || base.host,
    port: stored.port || base.port,
    user: stored.user || base.user,
    pass: stored.pass || base.pass,
    from: stored.from || base.from,
    adminEmail: stored.adminEmail || base.adminEmail,
  };
  cachedConfig = {at: Date.now(), cfg};
  return cfg;
}

const adminEmail = async () => (await resolveSmtpConfig()).adminEmail;

async function getTransporter(): Promise<Transporter | null> {
  const cfg = await resolveSmtpConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) return null;
  const sig = `${cfg.host}:${cfg.port}:${cfg.user}:${cfg.pass}`;
  if (!transporter || transporterSig !== sig) {
    transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: {user: cfg.user, pass: cfg.pass},
    });
    transporterSig = sig;
  }
  return transporter;
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
          <p style="margin:0;font-size:12px;color:#8a8a99;">IsabiEvents — Nigeria's premier ticket marketplace · <a href="https://events.isabi.cloud" style="color:${PRIMARY};">events.isabi.cloud</a></p>
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
  try {
    const cfg = await resolveSmtpConfig();
    const tx = await getTransporter();
    if (!tx) {
      console.warn(`[email] SMTP not configured — skipped "${opts.subject}" to ${opts.to}`);
      return false;
    }
    const from = cfg.from || `IsabiEvents <${cfg.user}>`;
    await tx.sendMail({from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text});
    console.log(`[email] sent "${opts.subject}" to ${opts.to}`);
    return true;
  } catch (err) {
    console.warn(`[email] failed to send "${opts.subject}":`, err instanceof Error ? err.message : err);
    return false;
  }
}

const money = (amount: number, currency: 'NGN' | 'USD') =>
  currency === 'USD' ? `$${amount.toFixed(2)}` : `₦${amount.toLocaleString()}`;

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Admin newsletter campaign — real send to one recipient. */
export async function sendNewsletterEmail(to: string, subject: string, body: string): Promise<boolean> {
  const paragraphs = body
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3d3d4d;white-space:pre-wrap;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`
    )
    .join('');
  return send({
    to,
    subject,
    html: layout(subject, paragraphs),
    text: body,
  });
}

/** Sent after account creation (main signup, checkout signup, or Google). */
export async function sendWelcomeEmail(
  name: string,
  email: string,
  role: string = 'attendee'
): Promise<boolean> {
  const base = process.env.APP_BASE_URL || 'https://events.isabi.cloud';
  const who = name ? `, ${name}` : '';

  // Organizer + staff get dedicated onboarding emails (different copy,
  // subject, and calls-to-action); attendees keep the marketplace welcome.
  if (role === 'organizer') {
    return send({
      to: email,
      subject: 'Welcome, Organizer! Let’s sell out your first event 🚀',
      html: layout(
        `You’re live as an organizer${who}!`,
        p(`Your IsabiEvents organizer account is ready. Create your event page in minutes, sell tickets with secure Bachs checkout, and track sales from your dashboard — all in one place.`) +
          `<a href="${base}/dashboard/organizer/create" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;margin-right:10px;">Create Your First Event</a>` +
          `<a href="${base}/dashboard/organizer" style="display:inline-block;background:#fff;color:${PRIMARY};padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;border:1px solid ${PRIMARY};">Open Dashboard</a>` +
          p(`<strong>Quick start checklist:</strong>`) +
          `<ul style="margin:0 0 18px;padding-left:22px;color:#55556a;line-height:1.9;">` +
          `<li>Create your first event — title, venue, date and ticket price.</li>` +
          `<li>Complete KYC verification to unlock payouts (settled 48 hours after each event).</li>` +
          `<li>Add gate staff from <strong>Vendors &amp; Staff</strong> so they get their own scanner access.</li>` +
          `</ul>` +
          `<p style="margin:0;font-size:12px;color:#8a8a99;">If you did not create this account, you can safely ignore this email.</p>`
      ),
      text: `Welcome! Your IsabiEvents organizer account is ready. Create your first event at ${base}/dashboard/organizer/create`,
    });
  }

  if (role === 'staff') {
    return send({
      to: email,
      subject: 'Welcome to the event team! Your scanner access is ready 🎫',
      html: layout(
        `You’ve been added as staff${who}!`,
        p(`An organizer has added you to their event team. Open the staff scanner to validate tickets at the gate — each scan checks the QR code against the live ticket list, so entry stays fast and fraud-free.`) +
          `<a href="${base}/dashboard/staff" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">Open Staff Scanner</a>` +
          p(`<strong>How it works:</strong>`) +
          `<ul style="margin:0 0 18px;padding-left:22px;color:#55556a;line-height:1.9;">` +
          `<li>Sign in with this email and open <strong>Dashboard → Staff</strong>.</li>` +
          `<li>Ask your organizer for the event and door/gate codes.</li>` +
          `<li>Scan each attendee’s QR ticket — valid tickets turn green, duplicates and fakes are rejected.</li>` +
          `</ul>` +
          `<p style="margin:0;font-size:12px;color:#8a8a99;">If you were not added to a team, contact your event organizer or reply to this email.</p>`
      ),
      text: `You've been added as staff on IsabiEvents. Open your scanner at ${base}/dashboard/staff`,
    });
  }

  return send({
    to: email,
    subject: 'Welcome to IsabiEvents! 🎟️',
    html: layout(
      `Welcome${who}!`,
      p(`Your IsabiEvents account is ready. Discover the best Nigerian concerts, festivals, tech summits and more — and check out in seconds with our secure Bachs checkout.`) +
        `<a href="${base}/discover" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">Discover Events</a>` +
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
    to: await adminEmail(),
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
    to: await adminEmail(),
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
    to: await adminEmail(),
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
        `<a href="${process.env.APP_BASE_URL || 'https://events.isabi.cloud'}/discover" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">Browse Events</a>`
    ),
    text: 'Thanks for subscribing to the IsabiEvents newsletter!',
  });
}

/** New-user alert to admin (signup of any kind). */
export async function sendAdminNewUserEmail(opts: {name: string; email: string; role: string; method: string}): Promise<boolean> {
  return send({
    to: await adminEmail(),
    subject: `👋 New ${opts.role} signup — ${opts.email}`,
    html: layout(
      'New account created',
      p(`<strong>${opts.name || 'Unnamed user'}</strong> (${opts.email}) created a <strong>${opts.role}</strong> account via ${opts.method}.`)
    ),
    text: `New ${opts.role} signup: ${opts.email} via ${opts.method}`,
  });
}

/** Shared shape for withdrawal request emails. */
export interface WithdrawalEmailData {
  id: string;
  organizerName: string;
  organizerEmail: string;
  amount: number;
  currency: 'NGN' | 'USD';
  method: 'bank' | 'crypto';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  network?: string;
  walletAddress?: string;
  status?: string;
  note?: string;
}

const withdrawalDestination = (w: WithdrawalEmailData) =>
  w.currency === 'NGN'
    ? `Bank transfer — <strong>${escapeHtml(w.bankName || '')}</strong>, A/C <strong>${escapeHtml(w.accountNumber || '')}</strong> (${escapeHtml(w.accountName || '')})`
    : `Crypto — <strong>${escapeHtml(w.network || '')}</strong> wallet <code>${escapeHtml(w.walletAddress || '')}</code>`;

/**
 * Sent when an organizer submits a withdrawal request:
 *  1. to the admin  — action needed (manual review)
 *  2. to the organizer — request received confirmation
 */
export async function sendWithdrawalRequestEmails(w: WithdrawalEmailData): Promise<void> {
  const base = process.env.APP_BASE_URL || 'https://events.isabi.cloud';

  await send({
    to: await adminEmail(),
    subject: `💸 New ${w.currency} withdrawal request — ${money(w.amount, w.currency)} from ${w.organizerName}`,
    html: layout(
      'New withdrawal request',
      p(`<strong>${escapeHtml(w.organizerName)}</strong> (${escapeHtml(w.organizerEmail)}) requested a withdrawal of <strong>${money(w.amount, w.currency)}</strong>.`) +
        p(`Destination: ${withdrawalDestination(w)}`) +
        p(`Reference: <code>${escapeHtml(w.id)}</code> — status <strong>pending</strong>. Transfers are manual: approve only after sending the funds.`) +
        `<a href="${base}/dashboard/admin/payouts" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">Review Request</a>`
    ),
    text: `Withdrawal request ${w.id}: ${w.organizerName} requested ${money(w.amount, w.currency)} (${w.currency === 'NGN' ? `bank ${w.bankName} ${w.accountNumber}` : `crypto ${w.network} ${w.walletAddress}`}). Review at ${base}/dashboard/admin/payouts`,
  });

  await send({
    to: w.organizerEmail,
    subject: `We received your ${w.currency} withdrawal request — under review`,
    html: layout(
      'Withdrawal request received',
      p(`Your request to withdraw <strong>${money(w.amount, w.currency)}</strong> is now under review by the IsabiEvents team.`) +
        p(`Destination: ${withdrawalDestination(w)}`) +
        p(`Reference: <code>${escapeHtml(w.id)}</code>. NGN bank transfers and USD crypto payouts are processed manually — you'll get another email the moment it's approved or declined.`) +
        `<a href="${base}/dashboard/organizer/payouts" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">View Payout Status</a>`
    ),
    text: `Your ${money(w.amount, w.currency)} withdrawal request (${w.id}) is under review. You'll be notified when it's processed.`,
  });
}

/** Sent to the organizer when the admin approves or rejects a request. */
export async function sendWithdrawalStatusEmail(w: WithdrawalEmailData): Promise<boolean> {
  const approved = w.status === 'approved';
  const base = process.env.APP_BASE_URL || 'https://events.isabi.cloud';
  return send({
    to: w.organizerEmail,
    subject: approved
      ? `✅ Your ${w.currency} withdrawal was approved — ${money(w.amount, w.currency)} on the way`
      : `⚠️ Your ${w.currency} withdrawal was declined — ${money(w.amount, w.currency)}`,
    html: layout(
      approved ? 'Withdrawal approved' : 'Withdrawal declined',
      p(
        approved
          ? `Good news — your withdrawal of <strong>${money(w.amount, w.currency)}</strong> has been <strong>approved</strong>. ${
              w.currency === 'NGN'
                ? 'The bank transfer has been queued for manual dispatch to your account.'
                : 'The crypto transfer has been queued for manual dispatch to your wallet.'
            }`
          : `Your withdrawal of <strong>${money(w.amount, w.currency)}</strong> was declined by our team.${
              w.note ? ` Reason: <strong>${escapeHtml(w.note)}</strong>.` : ''
            } You can submit a new request from your payouts page.`
      ) +
        p(`Destination: ${withdrawalDestination(w)} — reference <code>${escapeHtml(w.id)}</code>.`) +
        `<a href="${base}/dashboard/organizer/payouts" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">Open Payouts</a>`
    ),
    text: approved
      ? `Your ${money(w.amount, w.currency)} withdrawal (${w.id}) was approved and queued for payment.`
      : `Your ${money(w.amount, w.currency)} withdrawal (${w.id}) was declined.${w.note ? ` Reason: ${w.note}` : ''}`,
  });
}

/** Sent to the organizer when their KYC submission is approved or declined. */
export async function sendKycDecisionEmail(opts: {
  to: string;
  name: string;
  status: 'approved' | 'rejected';
}): Promise<boolean> {
  const approved = opts.status === 'approved';
  const base = process.env.APP_BASE_URL || 'https://events.isabi.cloud';
  return send({
    to: opts.to,
    subject: approved
      ? '✅ Identity verified — your organizer account is confirmed'
      : '⚠️ Identity verification needs another look',
    html: layout(
      approved ? 'Identity verified' : 'Verification declined',
      p(
        approved
          ? `Great news, ${escapeHtml(opts.name)} — your identity has been verified! Your profile now shows the verified badge, your new events are auto-approved, and you're eligible for instant ticket settlements.`
          : `Hi ${escapeHtml(opts.name)} — after reviewing your submission we need a little more information. Please check your ID details and document photo, then submit again from your verification page.`
      ) +
        `<a href="${base}/dashboard/organizer/kyc" style="display:inline-block;background:${PRIMARY};color:#fff;padding:12px 28px;border-radius:999px;font-weight:bold;text-decoration:none;">${approved ? 'Open Dashboard' : 'Resubmit Verification'}</a>` +
        `<p style="margin:18px 0 0;font-size:12px;color:#8a8a99;">IsabiEvents Identity Verification</p>`
    ),
    text: approved
      ? `Your identity has been verified. Open ${base}/dashboard/organizer`
      : `Your verification was declined — please resubmit at ${base}/dashboard/organizer/kyc`,
  });
}

