import {config} from 'dotenv';
config({path: '.env.local'});
config();

import {initializeApp} from 'firebase/app';
import {getFirestore, getDocs, collection} from 'firebase/firestore';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}, 'verify-anon-events');

(async () => {
  try {
    const snap = await getDocs(collection(getFirestore(app), 'events'));
    console.log(`ANONYMOUS CLIENT READ OK — ${snap.size} events visible (logged-out visitors)`);
    const ids = snap.docs.map((d) => d.id);
    const real = ids.filter((id) => !/^e\d+$/.test(id));
    console.log(`  real events: ${real.length}`, real);
    process.exit(snap.size === 17 ? 0 : 1);
  } catch (err) {
    console.log('FAILED:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
