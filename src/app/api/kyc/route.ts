import {NextResponse} from 'next/server';
import {requireAdmin, requireAuth, requireOrganizer, isResponse} from '@/lib/admin-auth';
import {admin} from '@/lib/server-admin';
import {sendKycDecisionEmail} from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST /api/kyc — organizer submits identity verification (organizer/admin).
 * GET  /api/kyc — admin: pending submissions · organizer: their own submissions.
 * PATCH /api/kyc — approve/reject (admin). Approve marks the user verified.
 */
export async function POST(req: Request) {
  const uid = await requireOrganizer(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const body = (await req.json()) as {
      idType?: string;
      idNumber?: string;
      businessType?: string;
      businessName?: string;
      rcNumber?: string;
      documentPhoto?: string;
    };
    const idType = (body.idType || '').trim();
    const idNumber = (body.idNumber || '').trim();
    if (!idType || !idNumber) {
      return NextResponse.json({error: 'An ID type and number are required.'}, {status: 400});
    }

    // One pending submission at a time — prevents duplicate reviews.
    const existing = await db.collection('kyc_submissions').where('uid', '==', uid).get();
    const pending = existing.docs.find(
      (d) => (d.data() as {status?: string}).status === 'pending'
    );
    if (pending) {
      return NextResponse.json(
        {error: 'You already have a submission under review. Please wait for our team to process it.'},
        {status: 400}
      );
    }

    const profileSnap = await db.collection('users').doc(uid).get();
    const profile = (profileSnap.exists ? profileSnap.data() : {}) as {name?: string; email?: string};

    // Optional: compressed document photo (dataURL, kept small client-side).
    const documentPhoto =
      typeof body.documentPhoto === 'string' &&
      body.documentPhoto.startsWith('data:image/') &&
      body.documentPhoto.length < 700_000
        ? body.documentPhoto
        : '';

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
      documentPhoto,
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
  const uid = await requireAuth(req);
  if (isResponse(uid)) return uid;
  const {getAdminDb} = await admin();
  const db = getAdminDb();
  if (!db) return NextResponse.json({error: 'Server credentials missing.'}, {status: 503});

  try {
    const caller = await db.collection('users').doc(uid).get();
    const role = caller.exists ? (caller.data() as {role?: string}).role : '';

    // Organizers get THEIR OWN submissions (any status) for the status view.
    if (role === 'organizer' || role === 'admin') {
      if (role === 'organizer') {
        const mineSnap = await db.collection('kyc_submissions').where('uid', '==', uid).get();
        const mine = mineSnap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
            date: (d.data() as {date?: string}).date || '',
          }))
          .sort((a, b) => String(b.date).localeCompare(String(a.date)));
        return NextResponse.json({mine});
      }
    } else {
      return NextResponse.json({error: 'Organizer access required.'}, {status: 403});
    }

    // Admin: pending submissions (single-field query; sorted in memory).
    const snap = await db.collection('kyc_submissions').where('status', '==', 'pending').get();
    const submissions = snap.docs
      .map((d) => {
        const x = d.data() as {
          name?: string; type?: string; date?: string; document?: string; email?: string;
          businessName?: string; rcNumber?: string; idType?: string; idNumber?: string;
          documentPhoto?: string;
        };
        return {
          id: d.id,
          name: x.name || x.email || 'Organizer',
          type: x.type || 'Individual',
          date: x.date || '',
          document: x.document || '',
          email: x.email || '',
          businessName: x.businessName || '',
          rcNumber: x.rcNumber || '',
          idType: x.idType || '',
          idNumber: x.idNumber || '',
          documentPhoto: x.documentPhoto || '',
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
  const {getAdminDb} = await admin();
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

    // Email the organizer the decision (send() never throws).
    if (sub.uid) {
      const profileSnap = await db.collection('users').doc(sub.uid).get();
      const profile = (profileSnap.exists ? profileSnap.data() : {}) as {email?: string};
      if (profile.email) {
        await sendKycDecisionEmail({
          to: profile.email,
          name: sub.name || 'Organizer',
          status: action === 'approve' ? 'approved' : 'rejected',
        });
      }
    }

    return NextResponse.json({ok: true, action, id});
  } catch (err) {
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Review failed.'},
      {status: 500}
    );
  }
}