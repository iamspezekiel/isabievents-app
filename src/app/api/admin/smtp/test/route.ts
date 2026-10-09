import {NextResponse} from 'next/server';
import nodemailer from 'nodemailer';
import {requireAdmin, isResponse} from '@/lib/admin-auth';
import {resolveSmtpConfig} from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/admin/smtp/test — verify + send a real test email.
 * body: { to?: string, smtp?: {host, port, user, pass, from} }
 * Unsent fields fall back to the saved/effective config. Always returns 200
 * with {ok} so the dashboard can show the exact SMTP error when it fails.
 */
export async function POST(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;

  try {
    const body = (await req.json()) as {
      to?: string;
      smtp?: {host?: string; port?: number | string; user?: string; pass?: string; from?: string};
    };
    const base = await resolveSmtpConfig();
    const s = body.smtp || {};

    const host = (s.host || '').trim() || base.host;
    const port = Number(s.port) || base.port;
    const user = (s.user || '').trim() || base.user;
    const pass = s.pass ? s.pass : base.pass;
    const from = (s.from || '').trim() || base.from;
    const to = (body.to || '').trim() || base.adminEmail;

    if (!host || !user || !pass) {
      return NextResponse.json({
        ok: false,
        error: 'SMTP is not fully configured (host, user and password are required).',
      });
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {user, pass},
    });

    await transport.verify();
    const info = await transport.sendMail({
      from: from || `IsabiEvents <${user}>`,
      to,
      subject: 'IsabiEvents SMTP test ✅',
      text: `SMTP is working. Sent at ${new Date().toISOString()}.`,
      html: `<p style="font-family:Arial,sans-serif;">✅ <strong>IsabiEvents SMTP test</strong></p>
<p style="font-family:Arial,sans-serif;font-size:14px;color:#3d3d4d;">Sent at ${new Date().toISOString()} · Host ${host}:${port}</p>`,
    });

    return NextResponse.json({ok: true, to, messageId: info.messageId});
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'SMTP test failed.',
    });
  }
}
