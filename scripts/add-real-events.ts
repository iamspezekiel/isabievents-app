/**
 * Loads REAL event listings researched from public event records (official
 * ticketing sites and news coverage) into Firestore, and makes the admin
 * account the organizer/owner of every event so admins can edit or delete
 * any listing from the dashboard.
 *
 * Sources (October 2026):
 *  - tix.dot360.co            (Design Week Lagos, Jokes n Jollof, Detty Dec Fest)
 *  - tickets.devfestlagos.com (DevFest Lagos 2026)
 *  - riotimesonline.com       (Abuja Afrojazz Festival 2026)
 *  - lagosaisummit.com        (Lagos AI Summit 2026)
 *  - boseatsafrica.com        (Wizkid Live in Abuja)
 *
 * Idempotent: re-running skips events that already exist by document id.
 *
 * Usage: npx tsx scripts/add-real-events.ts
 */
import {config} from 'dotenv';
config({path: '.env.local'});
config();

import {initializeApp, cert, getApps} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

const ADMIN_EMAIL = 'isabideveloper@gmail.com';

interface RealEvent {
  id: string; // also the slug
  title: string;
  category: string;
  city: string;
  venue: string;
  date: string; // ISO local datetime
  description: string;
  summary: string;
  priceMin: number;
  priceMax: number;
  image: string;
  tags: string[];
  source: string;
  inventory: number;
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const REAL_EVENTS: RealEvent[] = [
  {
    id: 'design-week-lagos-2026',
    title: 'Design Week Lagos 2026',
    category: 'exhibitions',
    city: 'Lagos',
    venue: 'National Theatre',
    date: '2026-10-22T10:00:00',
    description:
      'Design Week Lagos returns to the National Theatre for three days from 22–24 October 2026 — exhibitions, installations and conversations across Nigerian design. Day passes are free on the official ticketing site (DOT TIX). Listed from public event records; confirm details with the official organiser.',
    summary: 'Three days of design exhibitions and talks at the National Theatre, Lagos (22–24 Oct).',
    priceMin: 0,
    priceMax: 0,
    image: unsplash('photo-1501281668745-f7f57925c3b4'),
    tags: ['design', 'lagos', 'free', 'exhibition'],
    source: 'https://tix.dot360.co',
    inventory: 1000,
  },
  {
    id: 'jokes-n-jollof-2026',
    title: 'Jokes n Jollof',
    category: 'concerts',
    city: 'Lagos',
    venue: 'Livespot Entertarium',
    date: '2026-11-18T19:00:00',
    description:
      'A night of comedy and food at the Livespot Entertarium, Lagos, on 18 November 2026. Tickets start from ₦25,000 on DOT TIX. Listed from public event records; confirm details with the official organiser.',
    summary: 'Comedy night with jollof — Livespot Entertarium, Lagos, 18 Nov 2026.',
    priceMin: 25000,
    priceMax: 25000,
    image: unsplash('photo-1492684223066-81342ee5ff30'),
    tags: ['comedy', 'lagos', 'nightlife'],
    source: 'https://tix.dot360.co',
    inventory: 500,
  },
  {
    id: 'devfest-lagos-2026',
    title: 'DevFest Lagos 2026',
    category: 'technology',
    city: 'Lagos',
    venue: 'Venue TBA',
    date: '2026-11-13T09:00:00',
    description:
      'Google Developer Groups’ DevFest Lagos returns for two days on 13–14 November 2026: 20+ hands-on workshops, panel sessions, hackathons, masterclasses and an after-party. Standard tickets are ₦8,000 per day; the Full Experience ticket (both days) is ₦16,000. Listed from public event records; confirm details with the official organiser.',
    summary: 'Two days of workshops, keynotes and community — DevFest Lagos, 13–14 Nov 2026.',
    priceMin: 8000,
    priceMax: 16000,
    image: unsplash('photo-1540575467063-178a50c2df87'),
    tags: ['technology', 'lagos', 'developers', 'ai'],
    source: 'https://tickets.devfestlagos.com',
    inventory: 2000,
  },
  {
    id: 'abuja-afrojazz-festival-2026',
    title: 'Abuja Afrojazz Festival 2026',
    category: 'concerts',
    city: 'Abuja',
    venue: 'Venue TBA',
    date: '2026-11-21T17:00:00',
    description:
      'The Abuja Afrojazz Festival runs for a full week from 16–21 November 2026, closing with the main concert on Saturday 21 November. Early-bird tickets are ₦5,000 and VIP is ₦15,000. Listed from public event records; confirm details with the official organiser.',
    summary: 'Week-long Afrojazz festival in Abuja, main concert Sat 21 Nov 2026.',
    priceMin: 5000,
    priceMax: 15000,
    image: unsplash('photo-1493225457124-a3eb161ffa5f'),
    tags: ['jazz', 'abuja', 'music', 'festival'],
    source: 'https://www.riotimesonline.com/abuja-afrojazz-festival-2026/',
    inventory: 1500,
  },
  {
    id: 'lagos-ai-summit-2026',
    title: 'Lagos AI Summit 2026',
    category: 'technology',
    city: 'Lagos',
    venue: 'Oriental Hotel, Victoria Island',
    date: '2026-11-23T08:00:00',
    description:
      'Edition I of the Lagos AI Summit takes place on Monday 23 November 2026 at the Oriental Hotel, Victoria Island — 1,000 founders, engineers and enterprise leaders across four tracks (Enterprise & Financial Services, Healthcare AI, AI Builders, Governance). General early bird ₦10,000, Professional ₦25,000, VIP Executive Pass ₦250,000 (10 seats). Listed from public event records; confirm details with the official organiser.',
    summary: 'One day, four tracks, 1,000 practitioners — Oriental Hotel, Lagos, 23 Nov 2026.',
    priceMin: 10000,
    priceMax: 250000,
    image: unsplash('photo-1505373877841-8d25f7d46678'),
    tags: ['technology', 'ai', 'lagos', 'conference'],
    source: 'https://lagosaisummit.com/',
    inventory: 1000,
  },
  {
    id: 'wizkid-live-in-abuja-2026',
    title: 'Wizkid Live in Abuja',
    category: 'concerts',
    city: 'Abuja',
    venue: 'Eagle Square',
    date: '2026-12-13T17:00:00',
    description:
      'Afrobeats superstar Wizkid headlines one of Abuja’s biggest December events at Eagle Square on Sunday 13 December 2026, from 5:00 PM. Standard tickets start at ₦50,000; premium gold tables go up to ₦2,562,500. Listed from public event records; confirm details with the official organiser.',
    summary: 'Wizkid headlines at Eagle Square, Abuja — Sun 13 Dec 2026.',
    priceMin: 50000,
    priceMax: 2562500,
    image: unsplash('photo-1470229722913-7c0e2dbbafd3'),
    tags: ['concert', 'abuja', 'afrobeats', 'wizkid'],
    source: 'https://boseatsafrica.com/event/wizkid-live-in-abuja',
    inventory: 3000,
  },
  {
    id: 'detty-december-fest-grand-opening-2026',
    title: 'Detty December Fest: Grand Opening ft. Wizkid',
    category: 'festivals',
    city: 'Lagos',
    venue: 'Detty December Village',
    date: '2026-12-18T18:00:00',
    description:
      'The 13-day Detty December Fest (18–30 December 2026, Lagos) opens with Wizkid on the Detty Festival stage at the Detty December Village on Friday 18 December, 6:00 PM. Tickets on DOT TIX: General Access ₦50,000, Golden Circle ₦150,000, VIP Standing ₦300,000. Listed from public event records; confirm details with the official organiser.',
    summary: 'Wizkid opens the 13-day Detty December Fest — Detty December Village, Lagos, 18 Dec.',
    priceMin: 50000,
    priceMax: 300000,
    image: unsplash('photo-1459749411175-04bf5292ceea'),
    tags: ['festival', 'lagos', 'afrobeats', 'december'],
    source: 'https://tix.dot360.co/event/detty-december-festival-grand-opening-event',
    inventory: 5000,
  },
];

async function main() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (getApps().length === 0) {
    if (serviceAccount) {
      initializeApp({credential: cert(JSON.parse(serviceAccount))});
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp();
    } else {
      console.error(
        '✗ No server credentials.\n' +
          '  Set FIREBASE_SERVICE_ACCOUNT_KEY (service-account JSON, single line)\n' +
          '  or GOOGLE_APPLICATION_CREDENTIALS in .env.local'
      );
      process.exit(1);
    }
  }

  const db = getFirestore();
  const auth = getAuth();

  const adminUser = await auth.getUserByEmail(ADMIN_EMAIL);
  const adminProfileSnap = await db.collection('users').doc(adminUser.uid).get();
  const adminProfile = (adminProfileSnap.exists ? adminProfileSnap.data() : {}) as {name?: string};
  const organizerName = adminProfile.name || 'IsabiEvents';
  const nowIso = new Date().toISOString();

  // 1. Insert real events (idempotent by document id = slug).
  let created = 0;
  for (const ev of REAL_EVENTS) {
    const ref = db.collection('events').doc(ev.id);
    const exists = await ref.get();
    if (exists.exists) {
      console.log(`  • skip (exists): ${ev.title}`);
      continue;
    }
    await ref.set({
      slug: ev.id,
      title: ev.title,
      category: ev.category,
      city: ev.city,
      venue: ev.venue,
      date: ev.date,
      organizer: {name: organizerName, verified: true, avatar: ''},
      organizerUid: adminUser.uid,
      organizerEmail: ADMIN_EMAIL,
      image: ev.image,
      description: ev.description,
      summary: ev.summary,
      policies: 'Tickets are non-refundable unless the event is cancelled. Bring a valid ID matching your ticket.',
      price: {min: ev.priceMin, max: ev.priceMax},
      inventory: ev.inventory,
      tags: [...ev.tags, 'verified-source'],
      source: ev.source,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    created++;
    console.log(`  ✓ created: ${ev.title}`);
  }

  // 2. Make the admin the organizer/owner of EVERY event (incl. any older ones).
  const all = await db.collection('events').get();
  let reassigned = 0;
  for (const doc of all.docs) {
    const data = doc.data() as {
      organizerUid?: string;
      organizer?: {verified?: boolean; avatar?: string};
    };
    const needsUid = data.organizerUid !== adminUser.uid;
    const needsVerified = !data.organizer?.verified;
    if (needsUid || needsVerified) {
      await doc.ref.update({
        organizerUid: adminUser.uid,
        organizerEmail: ADMIN_EMAIL,
        organizer: {
          name: organizerName,
          verified: true,
          avatar: data.organizer?.avatar || '',
        },
        updatedAt: new Date().toISOString(),
      });
      reassigned++;
      console.log(`  ↻ admin now owns: ${doc.id}`);
    }
  }

  console.log(
    `\n✓ Done — ${created} real event(s) created, ${reassigned} event(s) re-owned by ${ADMIN_EMAIL}.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
