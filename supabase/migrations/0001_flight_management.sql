create extension if not exists "pgcrypto";

create type public.flight_status as enum ('scheduled', 'boarding', 'delayed', 'cancelled');
create type public.seat_class as enum ('economy', 'business', 'first');
create type public.booking_status as enum ('confirmed', 'rescheduled', 'cancelled');

create table public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_no text not null unique,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null,
  status public.flight_status not null default 'scheduled',
  base_price numeric(10,2) not null check (base_price >= 0),
  created_at timestamptz not null default now(),
  check (arrives_at > departs_at)
);

create table public.seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights(id) on delete cascade,
  seat_number text not null,
  class public.seat_class not null,
  is_available boolean not null default true,
  extra_fee numeric(10,2) not null default 0 check (extra_fee >= 0),
  created_at timestamptz not null default now(),
  unique (flight_id, seat_number)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_id uuid not null references public.flights(id),
  seat_id uuid not null references public.seats(id),
  status public.booking_status not null default 'confirmed',
  booked_at timestamptz not null default now(),
  total_price numeric(10,2) not null check (total_price >= 0),
  pnr_code text not null unique
);

create table public.passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date,
  created_at timestamptz not null default now()
);

create table public.reschedules (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_flight_id uuid not null references public.flights(id),
  new_flight_id uuid not null references public.flights(id),
  requested_at timestamptz not null default now(),
  fee_charged numeric(10,2) not null default 0 check (fee_charged >= 0)
);

create index seats_flight_id_idx on public.seats(flight_id);
create index bookings_user_id_idx on public.bookings(user_id);
create unique index bookings_active_seat_unique_idx
  on public.bookings(seat_id)
  where status in ('confirmed', 'rescheduled');
create index passengers_booking_id_idx on public.passengers(booking_id);
create index reschedules_booking_id_idx on public.reschedules(booking_id);

alter table public.seats replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.seats;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

create policy "Public can read flights" on public.flights for select using (true);
create policy "Public can read seats" on public.seats for select using (true);

create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can read own passengers"
  on public.passengers for select
  using (
    exists (
      select 1 from public.bookings
      where bookings.id = passengers.booking_id
      and bookings.user_id = auth.uid()
    )
  );

create policy "Users can read own reschedules"
  on public.reschedules for select
  using (
    exists (
      select 1 from public.bookings
      where bookings.id = reschedules.booking_id
      and bookings.user_id = auth.uid()
    )
  );

create or replace function public.reject_late_cancellation()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    if exists (
      select 1
      from public.flights
      where flights.id = old.flight_id
      and flights.departs_at <= now() + interval '2 hours'
    ) then
      raise exception 'Cancellation within 2 hours of departure is not allowed.';
    end if;
  end if;
  return new;
end;
$$;

create trigger reject_late_cancellation_trigger
before update of status on public.bookings
for each row execute function public.reject_late_cancellation();

create or replace function public.reserve_seat_and_create_booking(
  p_flight_id uuid,
  p_seat_id uuid,
  p_passengers jsonb,
  p_pnr_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_booking_id uuid;
  v_total numeric(10,2);
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  perform 1
  from public.seats
  where id = p_seat_id
    and flight_id = p_flight_id
    and is_available = true
  for update;

  if not found then
    raise exception 'Seat is no longer available.';
  end if;

  select flights.base_price + seats.extra_fee
  into v_total
  from public.flights
  join public.seats on seats.flight_id = flights.id
  where flights.id = p_flight_id
    and seats.id = p_seat_id;

  update public.seats
  set is_available = false
  where id = p_seat_id;

  insert into public.bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  values (v_user_id, p_flight_id, p_seat_id, v_total, p_pnr_code)
  returning id into v_booking_id;

  insert into public.passengers (booking_id, full_name, passport_no, nationality, dob)
  select
    v_booking_id,
    passenger->>'full_name',
    passenger->>'passport_no',
    passenger->>'nationality',
    nullif(passenger->>'dob', '')::date
  from jsonb_array_elements(p_passengers) as passenger;

  return v_booking_id;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_seat_id uuid;
begin
  select seat_id
  into v_seat_id
  from public.bookings
  where id = p_booking_id
    and user_id = v_user_id
    and status <> 'cancelled'
  for update;

  if v_seat_id is null then
    raise exception 'Booking was not found or cannot be cancelled.';
  end if;

  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id
    and user_id = v_user_id;

  update public.seats
  set is_available = true
  where id = v_seat_id;
end;
$$;

create or replace function public.reschedule_booking(p_booking_id uuid, p_new_flight_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_booking public.bookings;
  v_old_flight public.flights;
  v_new_flight public.flights;
  v_fee numeric(10,2);
begin
  select * into v_booking
  from public.bookings
  where id = p_booking_id
    and user_id = v_user_id
    and status <> 'cancelled'
  for update;

  if v_booking.id is null then
    raise exception 'Booking was not found.';
  end if;

  select * into v_old_flight from public.flights where id = v_booking.flight_id;
  select * into v_new_flight from public.flights where id = p_new_flight_id;

  if v_new_flight.id is null or v_old_flight.origin <> v_new_flight.origin or v_old_flight.destination <> v_new_flight.destination then
    raise exception 'Reschedule must stay on the same route.';
  end if;

  v_fee := greatest(0, v_new_flight.base_price - v_old_flight.base_price);

  insert into public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  values (p_booking_id, v_booking.flight_id, p_new_flight_id, v_fee);

  update public.bookings
  set flight_id = p_new_flight_id,
      status = 'rescheduled',
      total_price = total_price + v_fee
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.reserve_seat_and_create_booking(uuid, uuid, jsonb, text) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.reschedule_booking(uuid, uuid) to authenticated;
