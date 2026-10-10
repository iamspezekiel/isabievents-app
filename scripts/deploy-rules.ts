/**
 * Deploys the repo's firestore.rules to the live Firebase project using the
 * service account (Firebase Rules REST API — no firebase-tools CLI needed).
 *
 * Background: the live rules denied ALL client reads of `events`
 * ("Missing or insufficient permissions"), so no events rendered on the site.
 * This script shows the live rules, uploads the repo file as a new ruleset
 * and points the `cloud.firestore` release at it.
 *
 * Note: the firebase.rules scope does not exchange to an access token for
 * this service account — cloud-platform does, and the Rules API accepts it.
 *
 * Usage:
 *   npx tsx scripts/deploy-rules.ts
 */
import {config} from 'dotenv';
config({path: '.env.local'});
config();

import {createSign} from 'crypto';
import {readFileSync} from 'fs';
import {join} from 'path';

const SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

const b64url = (i: string | Buffer) =>
  Buffer.from(i).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

async function accessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({alg: 'RS256', typ: 'JWT'}));
  const payload = b64url(
    JSON.stringify({iss: sa.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600})
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const sig = signer.sign(sa.private_key).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(`${header}.${payload}.${sig}`)}`,
  });
  const text = await res.text();
  let data: {access_token?: string; error?: string} = {};
  try {
    data = JSON.parse(text);
  } catch {
    /* handled below */
  }
  if (!data.access_token) {
    throw new Error(`Token exchange failed: ${res.status} ${text.slice(0, 300)}`);
  }
  return data.access_token;
}

async function main() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    console.error('✗ FIREBASE_SERVICE_ACCOUNT_KEY missing');
    process.exit(1);
  }
  const sa = JSON.parse(key) as ServiceAccount;
  const token = await accessToken(sa);
  const base = `https://firebaserules.googleapis.com/v1/projects/${sa.project_id}`;
  const auth = {Authorization: `Bearer ${token}`};

  // 1. Show currently deployed rules (diagnostic).
  const relRes = await fetch(`${base}/releases`, {headers: auth});
  const relText = await relRes.text();
  if (!relText.trim().startsWith('{')) {
    console.error('✗ releases endpoint:', relRes.status, relText.slice(0, 300));
    process.exit(1);
  }
  const releases = JSON.parse(relText) as {releases?: {name?: string; rulesetName?: string}[]};
  console.log('Live releases:');
  for (const r of releases.releases || []) console.log(`  ${r.name} → ${r.rulesetName}`);

  const firestoreRelease = (releases.releases || []).find((r) => r.name?.includes('firestore'));
  if (firestoreRelease?.rulesetName) {
    const shortName = firestoreRelease.rulesetName.split('/').slice(-2).join('/');
    const rsRes = await fetch(`${base}/${shortName}`, {headers: auth});
    try {
      const rs = (await rsRes.json()) as {source?: {files?: {content?: string}[]}};
      console.log('\n--- LIVE firestore rules ---');
      console.log((rs.source?.files?.[0]?.content || '(empty)').slice(0, 1500));
      console.log('--- END LIVE ---\n');
    } catch {
      console.log('  (could not read live ruleset content)');
    }
  }

  // 2. Upload the repo rules file as a new ruleset.
  const rulesContent = readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8');
  const createRes = await fetch(`${base}/rulesets`, {
    method: 'POST',
    headers: {...auth, 'Content-Type': 'application/json'},
    body: JSON.stringify({source: {files: [{name: 'firestore.rules', content: rulesContent}]}}),
  });
  const ruleset = (await createRes.json()) as {name?: string; error?: {message?: string}};
  if (!ruleset.name) {
    console.error('✗ Ruleset creation failed:', JSON.stringify(ruleset));
    process.exit(1);
  }
  console.log('✓ Ruleset created:', ruleset.name);

  // 3. Point the firestore release at the new ruleset.
  const releaseName = firestoreRelease?.name || `projects/${sa.project_id}/releases/cloud.firestore`;
  const releaseUrl = `https://firebaserules.googleapis.com/v1/${releaseName}`;
  const pubRes = await fetch(releaseUrl, {
    method: 'PATCH',
    headers: {...auth, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      release: {name: releaseName, rulesetName: ruleset.name},
      updateMask: 'rulesetName',
    }),
  });
  const pub = (await pubRes.json()) as {name?: string; rulesetName?: string; error?: {message?: string}};
  if (pub.error || !pub.rulesetName) {
    console.error('✗ Release update failed:', JSON.stringify(pub));
    process.exit(1);
  }
  console.log('✓ Release published:', pub.name, '→', pub.rulesetName);
  console.log('\nLive Firestore rules now match firestore.rules in the repo.');
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
