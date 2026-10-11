/**
 * Server-side notification helper (Admin SDK — bypasses Firestore rules).
 *
 * Notifications live in the `notifications` collection:
 *   { userId, title, body, type, href?, read, createdAt }
 * They are read via /api/notifications (never queried client-side directly),
 * so no security-rule changes are needed. All calls are fire-and-forget safe:
 * a failure never breaks the triggering action.
 */
import {admin} from '@/lib/server-admin';

export type NotificationType = 'success' | 'info' | 'primary' | 'warning';

export interface NotificationInput {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  href?: string;
}

/** Create one notification. Returns true on success. */
export async function createNotification(input: NotificationInput): Promise<boolean> {
  try {
    const {getAdminDb} = await admin();
    const db = getAdminDb();
    if (!db || !input.userId) return false;
    await db.collection('notifications').add({
      userId: input.userId,
      title: String(input.title || '').slice(0, 160),
      body: String(input.body || '').slice(0, 600),
      type: input.type || 'info',
      href: input.href || '',
      read: false,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[notifications] create failed:', err);
    return false;
  }
}

/** Create the same notification for several users. */
export async function notifyUsers(userIds: string[], input: Omit<NotificationInput, 'userId'>): Promise<void> {
  await Promise.all(
    [...new Set(userIds.filter(Boolean))].map((userId) => createNotification({...input, userId}))
  );
}

/** Every user with the given role(s) — used to broadcast to all admins. */
export async function userIdsByRole(db: FirebaseFirestore.Firestore, roles: string[]): Promise<string[]> {
  const snap = await db.collection('users').where('role', 'in', roles).limit(500).get();
  return snap.docs.map((d) => d.id);
}
