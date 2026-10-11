"use client";

/**
 * Notifications — real, per-user feed shared by every role (attendee,
 * organizer, staff, vendor, admin). Data comes from /api/notifications
 * (Firestore `notifications` collection via the Admin SDK), so it works for
 * any signed-in account. Clicking a notification opens its destination and
 * marks it read; "Mark all read" clears everything.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Ticket, Star, Zap, Clock, CheckCircle2, AlertTriangle, Loader2, RefreshCw, Megaphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api-fetch';

type NotifType = 'success' | 'info' | 'primary' | 'warning';

interface Notif {
  id: string;
  title: string;
  body: string;
  type: NotifType;
  href?: string;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<NotifType, typeof Bell> = {
  success: Ticket,
  info: Zap,
  primary: Star,
  warning: AlertTriangle,
};

const TYPE_CLASSES: Record<NotifType, string> = {
  success: 'bg-green-500/10 text-green-500',
  info: 'bg-blue-500/10 text-blue-500',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-yellow-500/10 text-yellow-600',
};

/** "2026-01-02T..." -> "2 hours ago" (falls back to the date). */
function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    apiFetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.notifications)) {
          setItems(d.notifications as Notif[]);
        } else if (d?.error) {
          throw new Error(d.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!unread) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ all: true }) });
    } catch { /* optimistic update stands */ }
    toast({ title: "All caught up!", description: "All notifications marked as read." });
  };

  const openItem = async (n: Notif) => {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      try {
        await apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id: n.id }) });
      } catch { /* optimistic update stands */ }
    }
    if (n.href) router.push(n.href);
  };

  return (
    <div className="p-4 pb-16 md:p-12 md:pb-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="font-headline text-2xl md:text-4xl tracking-tighter">Notifications</h1>
            <p className="text-muted-foreground font-medium">
              {unread > 0 ? `You have ${unread} unread update${unread === 1 ? '' : 's'}.` : 'You are all caught up.'}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full h-10 px-6 font-bold gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5 transition-all"
            onClick={markAllRead}
            disabled={!unread}
          >
            <CheckCircle2 className="w-4 h-4" /> Mark all as read
          </Button>
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="py-32 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-4 font-medium">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="py-32 text-center bg-card/20 border border-dashed border-border/50 rounded-[3rem]">
              <AlertTriangle className="w-12 h-12 text-yellow-500/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium mb-4">Could not load notifications.</p>
              <Button variant="outline" className="rounded-full gap-2 font-bold" onClick={load}>
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          ) : items.length > 0 ? (
            items.map((n) => (
              <NotificationItem
                key={n.id}
                icon={ICONS[n.type] || Megaphone}
                title={n.title}
                desc={n.body}
                time={timeAgo(n.createdAt)}
                type={n.type}
                unread={!n.read}
                onClick={() => openItem(n)}
              />
            ))
          ) : (
            <div className="py-32 text-center bg-card/20 border border-dashed border-border/50 rounded-[3rem] animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-muted-foreground/20" />
              </div>
              <h3 className="font-headline text-2xl mb-2">No notifications</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                You are all caught up! Updates about your account and events will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ icon: Icon, title, desc, time, type, unread = false, onClick }: any) {
  const typeClasses = TYPE_CLASSES[type as NotifType] || TYPE_CLASSES.info;
  return (
    <div
      className={cn(
        "group relative bg-card border border-border p-6 rounded-[2rem] flex items-start gap-6 text-left hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer",
        unread && "border-primary/20 shadow-[0_10px_40px_-15px_rgba(126,124,255,0.1)] bg-primary/[0.01]"
      )}
      onClick={onClick}
    >
      {unread && (
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">New</span>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      )}
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
        typeClasses
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <h4 className={cn(
            "font-bold text-lg leading-tight tracking-tight pr-12 transition-colors",
            unread ? "text-foreground" : "text-foreground/80"
          )}>{title}</h4>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest shrink-0">
            <Clock className="w-3 h-3" />
            {time}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{desc}</p>
      </div>
    </div>
  );
}
