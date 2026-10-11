'use client';

/**
 * The marketing "Stay in the Loop" newsletter card. Rendered inside the shared
 * footer, but only on the homepage so it stays a hero moment, not site-wide.
 */
import {usePathname} from 'next/navigation';
import {NewsletterForm} from '@/components/newsletter-form';

export function FooterNewsletter() {
  const pathname = usePathname() || '';
  // Only show on the homepage (/), never on other routes.
  if (pathname !== '/') return null;

  return (
    <section className="relative mx-auto mb-14 max-w-6xl overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-10">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="space-y-2 text-center lg:text-left">
          <h3 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter">
            Stay in the <span className="text-primary">Loop</span>
          </h3>
          <p className="text-muted-foreground font-medium">Get first access to Nigerian concerts, festivals, and tech summits.</p>
        </div>
        <div className="w-full lg:max-w-md">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
