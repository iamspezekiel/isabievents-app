'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {Bell} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {apiFetch} from '@/lib/api-fetch';

type Notif = {id: string; read?: boolean};

/**
 * Header notification bell with a live unread count. Links to the shared
 * notifications page. Reused across every dashboard (attendee, admin,
 * organizer, staff, vendor) so the entry point is consistent everywhere.
 */
export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await apiFetch('/api/notifications');
        const data = await res.json().catch(() => ({}));
        if (!alive || !res.ok || !Array.isArray(data.notifications)) return;
        setUnread((data.notifications as Notif[]).filter((n) => !n.read).length);
      } catch {
        /* leave the count as-is on a transient error */
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <Button variant="ghost" size="icon" className="rounded-full relative" asChild title="Notifications">
      <Link href="/dashboard/attendee/notifications" aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        )}
      </Link>
    </Button>
  );
}