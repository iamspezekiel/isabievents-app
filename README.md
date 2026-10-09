# **App Name**: IsabiEvents

## Core Features:

- Event Marketplace Hub: A modern discovery portal featuring smart category filters, trending carousels, and city-based event sorting.
- AI Content Assistant: An intelligent tool that assists organizers in drafting professional event descriptions and policy copy based on event type.
- Secure Checkout & QR Wallet: Multi-tier ticket purchasing with immediate digital QR code generation and an encrypted ticket wallet for attendees.
- PostgreSQL Ticket Architecture: High-concurrency database structure managing real-time inventory, ticket transfers, and entry logs using PostgreSQL.
- Organizer Performance Console: A robust dashboard for tracking sales charts, conversion rates, and revenue management.
- Gate Entry Tool: A mobile-optimized scanning interface for event staff to validate QR tickets and monitor entry flow with duplicate detection.
- Integrated Payment Settlements: Native integration with Bachs for automated NGN & USD ticket payments and organizer payouts.

## Style Guidelines:

- Primary Color: Electric Indigo (#7E7CFF) symbolizing high energy and tech-forwardness. This provides strong contrast against a dark theme.
- Background Color: Deep Night Navy (#16161D), a heavily desaturated indigo providing an premium, high-end gallery aesthetic.
- Accent Color: Azure Sky (#4D8BFF), an analogous blue hue used for interactive states, highlighting and active ticket indicators.
- A bold pairing: 'Poppins' for headlines to maintain a contemporary geometric look, and 'Inter' for body text to ensure maximum readability for ticket data and analytics.
- Sharp, minimalist line-art icons that maintain a 'pro' marketplace feel without cluttering complex dashboard views.
- A tiered grid system focusing on content hierarchy, with prominent search fields and responsive card-based navigation for event listings.
- Micro-interactions on hover for event cards and sleek modal transitions for the checkout flow.
---

## Setup & Deployment

### Local development
```bash
npm install
cp .env.example .env   # then fill in credentials (see below)
npm run seed           # optional: seed Firestore with demo events + users (needs FIREBASE_SERVICE_ACCOUNT_KEY)
npm run dev            # http://localhost:9002
```

The app runs in **demo mode** for any service left unconfigured (mock data, simulated payments, skipped emails) — enable services one by one via `.env`.

### Environment variables (all listed in `.env.example`)
| Group | Keys |
|---|---|
| Firebase (client) | `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` |
| Firebase Admin (server) | `FIREBASE_SERVICE_ACCOUNT_KEY` (service-account JSON, single line) |
| Bachs payments | `BACHS_API_KEY`, `BACHS_WEBHOOK_SECRET`, `APP_BASE_URL` (public **https** origin) |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` |
| Email (SMTP) | `SMTP_HOST`, `SMTP_PORT` (465 if 587 blocked), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (`Name <address>`), `ADMIN_EMAIL` |
| WatchUp (optional) | `NEXT_PUBLIC_WATCHUP_PROJECT`, `NEXT_PUBLIC_WATCHUP_KEY`, `NEXT_PUBLIC_WATCHUP_BASE_URL` |
| AI (optional) | `GOOGLE_API_KEY` |

### Production checklist
1. **Hosting must use the same env vars** — production does not read your local `.env` (e.g. Firebase App Hosting ? backend ? Environment variables).
2. **Firebase ? Authentication ? Authorized domains** — add your production domain (required for Google sign-in and password-reset redirects).
3. **Bachs webhook** — Developer Portal ? Webhooks ? add destination `https://<your-domain>/api/webhooks/bachs` (events: `checkout.completed`, `collection.succeeded`, `collection.failed`). Fulfilment requires `FIREBASE_SERVICE_ACCOUNT_KEY` server-side.
4. **Firestore rules** — deploy with `firebase deploy --only firestore:rules` (rules file included).
