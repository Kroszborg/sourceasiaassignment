# Source Asia Air - Flight Management PWA

Flight Management internship assignment built with Next.js 16 App Router, shadcn, Tailwind CSS, Supabase Auth/Postgres/Realtime, atomic booking RPCs, Zustand persistence, and PWA support through `next-pwa`.

## Features

- Flight search by origin, destination, date, and passenger count.
- Results page with fare, duration, status, and class-aware seat fees.
- Booking flow with passenger details, live aircraft seat map, and PNR confirmation.
- Supabase schema with RLS, seat-locking RPC, cancellation RPC, reschedule RPC, and a DB-level 2-hour cancellation guard.
- My Bookings page with status badges, same-route rescheduling, cancellation confirmation, and last-bookings cache.
- Zustand stores split into booking/search state and user/cache state. Passport numbers are excluded from persisted localStorage.
- `next-pwa` manifest/icons, install prompt, service worker, flight-search caching, static asset caching, and offline fallback page.

## Environment

The app only needs these values at runtime:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is also supported as a fallback if your Supabase project uses the newer naming.

For seed scripts:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SEED_USER_EMAIL=test.passenger@example.com
SEED_USER_PASSWORD=SourceAsia123!
```

The existing `.env` already contains the required Supabase URL/key names. Do not commit `.env`; `.env.example` lists the safe variable names.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_flight_management.sql` in the Supabase SQL editor.
3. Seed demo data using either SQL or the script:

```bash
npm run seed:demo
```

The script creates 8 flights across 4 routes, 864 seats, and the test user account. If you prefer SQL editor seeding, run `supabase/migrations/0002_seed_flights.sql` and then `npm run seed:test-user`.

4. Enable Realtime for the `seats` table in Supabase if it is not already enabled.
5. In Auth settings, either disable email confirmation for local testing or confirm the seed/test user.

Default test credentials:

```text
test.passenger@example.com
SourceAsia123!
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Quality checks:

```bash
npm run lint
npm run build
```

## Architecture Notes

- Server Components read flights, seats, and bookings through `src/lib/data.ts`.
- Supabase browser client is only used for auth/realtime client behavior; server reads and mutations use server-side clients/actions.
- Mutations go through server actions in `src/app/actions.ts`, then into Supabase RPCs.
- `reserve_seat_and_create_booking` locks the selected seat row with `for update`, marks it unavailable, creates the booking, and inserts passengers in one transaction.
- `cancel_booking` updates booking status and frees the seat atomically; the trigger rejects cancellation within 2 hours of departure.
- `reschedule_booking` only allows same-route flights and records the fare difference in `reschedules`.
- `useFlightStore` persists search, selected flight, selected seat, current booking step, and safe passenger draft data. Its `partialize` deliberately excludes passport numbers.
- `useUserStore` persists only the auth session token/email through Zustand. Last bookings are cached separately in `localStorage` for offline reading and are cleared on logout.

## PWA Notes

The app uses `next-pwa`, `manifest.webmanifest`, SVG icons, `/offline`, an install prompt, and runtime caching rules:

- `StaleWhileRevalidate` for Supabase flight search results.
- `CacheFirst` for static assets.
- Offline fallback document at `/offline`.

Add a Lighthouse PWA screenshot here after deploying:

```text
TODO: Insert Lighthouse PWA screenshot before final submission.
```

## Deployment

Vercel is recommended. Add the same Supabase env vars in Vercel project settings, deploy, then submit both the GitHub repository link and production URL.

## Submission Checklist

- [x] Public GitHub repository ready with source files and meaningful commit groups to create.
- [x] `.env.example` with Supabase runtime and seed variables.
- [x] Supabase migration SQL files in `supabase/migrations`.
- [x] Seed script for flights, seats, and test user account.
- [x] README with local setup, Supabase config, and Zustand store explanation.
- [ ] Deployed Vercel preview URL.
- [ ] Lighthouse PWA screenshot after deployment.
