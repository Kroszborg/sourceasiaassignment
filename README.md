# Source Asia Air - Flight Management PWA

Production-style Flight Management web app for the internship assignment. It supports flight search, booking, visual seat selection, Supabase Auth, booking management, rescheduling, cancellation, Zustand persistence, and PWA installation/offline behavior.

## Demo Account

Use this account to test protected flows:

```text
Email: test.passenger@example.com
Password: SourceAsia123!
```

The same credentials are shown and prefilled on `/auth`.

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Supabase Auth, PostgreSQL, RLS, RPC functions, and Realtime
- Zustand with `persist`
- Tailwind CSS and shadcn components
- `next-pwa` with manifest, icons, runtime caching, and offline fallback

## Implemented Features

- Flight search by origin, destination, date, and passenger count.
- Route-safe search form that prevents invalid seeded route pairs.
- Results page with price, duration, aircraft, status, and class-aware booking.
- Passenger form with passport data kept out of persisted local storage.
- Scrollable mobile-friendly aircraft seat map with first, business, and economy zones.
- Seat states for available, selected, and occupied, with tooltip details.
- Supabase Realtime subscription for live seat availability updates.
- Atomic seat reservation through an RPC that locks the seat row.
- Confirmation page with generated PNR, flight, passenger, and seat details.
- My Bookings page with status badges, same-route rescheduling, and cancellation dialogs.
- DB-level cancellation protection within 2 hours of departure.
- Light/dark mode toggle with shadcn-compatible theme tokens.
- PWA manifest, install prompt, static asset cache, flight search cache, and offline page.

## Environment

Create `.env` from `.env.example`.

Required for the app:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Supported optional alias:

```bash
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Required only for seed scripts:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SEED_USER_EMAIL=test.passenger@example.com
SEED_USER_PASSWORD=SourceAsia123!
```

Do not commit `.env`.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_flight_management.sql` in the SQL editor.
3. Seed demo data:

```bash
npm run seed:demo
```

The seed script creates:

- 8 flights across 4 routes
- 864 seats
- demo test user

If you prefer SQL-only seeding, run `supabase/migrations/0002_seed_flights.sql`, then run:

```bash
npm run seed:test-user
```

Realtime is enabled for `public.seats` in the migration. If your Supabase project blocks publication changes in SQL, enable Realtime for the `seats` table manually in the dashboard.

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Quality checks:

```bash
npm run lint
npm run build
```

## Architecture Notes

- Server reads are centralized in `src/lib/data.ts`.
- Supabase server client is used for Server Components and server actions.
- Supabase browser client is used for auth state and Realtime only.
- Mutations live in `src/app/actions.ts` and call database RPC functions.
- `reserve_seat_and_create_booking` uses `for update` to prevent double booking.
- `cancel_booking` updates booking status and frees the seat atomically.
- `reschedule_booking` only allows same-route alternatives and records fee differences.

## Zustand Store Design

- `useFlightStore` persists search query, selected flight, selected seat, current step, and safe passenger draft data.
- `useFlightStore` uses `partialize` to exclude passport numbers from local storage.
- `useUserStore` persists only the auth token/email session data through Zustand.
- Cached bookings are stored separately for offline reading and cleared on logout.
- Booking state resets after successful booking cancellation and logout.

## PWA Notes

`next-pwa` is configured in `next.config.ts`.

- `StaleWhileRevalidate` for Supabase flight search requests.
- `CacheFirst` for static assets.
- Manifest includes app name, theme color, display mode, and 192/512 icons.
- Offline fallback route: `/offline`.
- Install prompt banner appears when the browser fires `beforeinstallprompt`.

Lighthouse PWA screenshot:

```text
TODO: Add screenshot after Vercel deployment.
```

## Submission Checklist

- [x] Descriptive Git commit history.
- [x] `.env.example` with Supabase variables.
- [x] Supabase migrations in `supabase/migrations`.
- [x] Seed script with flights, seats, and test user.
- [x] README with setup, Supabase config, and Zustand explanation.
- [x] Responsive light/dark UI.
- [ ] Vercel production URL.
- [ ] Lighthouse PWA screenshot after deployment.

## Deployment

Deploy on Vercel, add the same Supabase environment variables in project settings, then run a production Lighthouse audit and add the screenshot above.
