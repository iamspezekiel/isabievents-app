/**
 * POST /api/upload — uploads media to Cloudflare R2 (S3-compatible API).
 *
 * Accepts multipart/form-data with a single `file` field and optional
 * `folder` (e.g. "events", "avatars"). Returns the public URL.
 *
 * Requires env (see .env.example):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET, R2_PUBLIC_URL  (custom domain or https://pub-<hash>.r2.dev)
 */
import {NextResponse} from 'next/server';
import {AwsClient} from 'aws4fetch';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'application/pdf': 'pdf',
};

function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );
}

export async function POST(req: Request) {
  if (!isR2Configured()) {
    return NextResponse.json(
      {error: 'R2 not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.'},
      {status: 503}
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({error: 'Expected multipart/form-data.'}, {status: 400});
  }

  const file = form.get('file');
  const folder = String(form.get('folder') || 'media').replace(/[^a-z0-9_-]/gi, '');

  if (!(file instanceof File)) {
    return NextResponse.json({error: 'A `file` field is required.'}, {status: 400});
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({error: 'File exceeds the 8 MB limit.'}, {status: 413});
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      {error: `Unsupported content type: ${file.type}`},
      {status: 415}
    );
  }

  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const accountId = process.env.R2_ACCOUNT_ID!;
  const bucket = process.env.R2_BUCKET!;

  const s3 = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: 's3',
    region: 'auto',
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const putRes = await s3.fetch(
      `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`,
      {
        method: 'PUT',
        body: arrayBuffer,
        headers: {
          'Content-Type': file.type,
          'Content-Length': String(file.size),
        },
      }
    );
    if (!putRes.ok) {
      const text = await putRes.text();
      console.error('[upload] R2 put failed:', putRes.status, text);
      return NextResponse.json({error: `R2 upload failed (${putRes.status}).`}, {status: 502});
    }

    const publicBase = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    const url = publicBase
      ? `${publicBase}/${key}`
      : `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;

    return NextResponse.json({url, key, contentType: file.type});
  } catch (err) {
    console.error('[upload] error:', err);
    return NextResponse.json({error: 'Upload failed.'}, {status: 500});
  }
}
