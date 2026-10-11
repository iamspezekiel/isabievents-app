import { Ticket } from 'lucide-react';

/**
 * The app logo mark used as the default organizer profile image whenever no
 * custom photo has been uploaded (a primary-colored tile with the ticket icon,
 * matching the brand Logo).
 */
export function DefaultAvatar({ className }: { className?: string }) {
  return (
    <div
      className={`bg-primary flex items-center justify-center text-primary-foreground ${className || ''}`}
      aria-label="IsabiEvents"
    >
      <Ticket className="w-1/2 h-1/2" />
    </div>
  );
}