import {NextResponse} from 'next/server';
import {requireAdmin, requireOrganizer, isResponse} from '@/lib/admin-auth';
import {getAdminDb} from '@/lib/firebase-admin';

export const runtime = 'nodejs';

/**
 * POST /api/kyc — organizer submits identity verification (organizer/admin).
 * GET  /api/kyc — pending submissions (admin).
 * PATCH /api/kyc — approve/reject (admin). Approve marks the user verified.
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {
      idType?: string;
      idNumber?: string;
      businessType?: string;
      businessName?: string;
      rcNumber?: string;
    };
    const idType = (body.idType || '').trim();
    const idNumber = (body.idNumber || '').trim();
    if (!idType || !idNumber) {
      return NextResponse.json({error: 'An ID type and number are required.'}, {status: 400});
    }

    const profileSnap = await db.collection('users').doc(uid).get();
    const profile = (profileSnap.exists ? profileSnap.data() : {}) as {name?: string; email?: string};

    const ref = db.collection('kyc_submissions').doc();
    const nowIso = new Date().toISOString();
    await ref.set({
      uid,
      email: profile.email || '',
      name: profile.name || body.businessName || 'Organizer',
      type: body.businessType === 'company' ? 'Company' : 'Individual',
      businessName: (body.businessName || '').trim(),
      rcNumber: (body.rcNumber || '').trim(),
      idType,
      idNumber,
      document: `${idType.toUpperCase()} · ${idNumber}`,
      date: nowIso,
      status: 'pending',
    });
    return NextResponse.json({ok: true, id: ref.id});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Submission failed.'},
      {status: 500}
    );
  }
}

export async function GET(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    // Single-field query (no composite index needed); sorted in memory.
    const snap = await db.collection('kyc_submissions').where('status', '==', 'pending').get();
    const submissions = snap.docs
      .map((d) => {
        const x = d.data() as {name?: string; type?: string; date?: string; document?: string; email?: string};
        return {
          id: d.id,
          name: x.name || x.email || 'Organizer',
          type: x.type || 'Individual',
          date: x.date || '',
          document: x.document || '',
        };
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return NextResponse.json({submissions});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Failed to load submissions.'},
      {status: 500}
    );
  }
}

export async function PATCH(req: Request) {
  const uid = await requireAdmin(req);
  if (isResponse(uid)) return uid;
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {id?: string; action?: string};
    const id = (body.id || '').trim();
    const action = body.action;
    if (!id || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({error: 'id and a valid action are required.'}, {status: 400});
    }

    const ref = db.collection('kyc_submissions').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({error: 'Submission not found.'}, {status: 404});
    const sub = snap.data() as {uid?: string; name?: string};

    await ref.update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: uid,
    });

    if (action === 'approve' && sub.uid) {
      await db
        .collection('users')
        .doc(sub.uid)
        .set({verified: true, verifiedAt: new Date().toISOString()}, {merge: true});
    }

    return NextResponse.json({ok: true, action, id});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Review failed.'},
      {status: 500}
    );
  }
}