import { demoBookings, demoFlights, buildDemoSeats } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Booking, Flight, SearchQuery, Seat } from "@/lib/types";

export async function getFlights(query?: Partial<SearchQuery>): Promise<Flight[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return filterFlights(demoFlights, query);
  }

  let request = supabase.from("flights").select("*").order("departs_at", { ascending: true });

  if (query?.origin) request = request.ilike("origin", query.origin);
  if (query?.destination) request = request.ilike("destination", query.destination);
  if (query?.date) {
    const start = new Date(query.date);
    const end = new Date(query.date);
    end.setDate(end.getDate() + 1);
    request = request.gte("departs_at", start.toISOString()).lt("departs_at", end.toISOString());
  }

  const { data, error } = await request;
  if (error) {
    console.error(error);
    return filterFlights(demoFlights, query);
  }

  return data ?? [];
}

export async function getFlight(id: string): Promise<Flight | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoFlights.find((flight) => flight.id === id) ?? null;
  }

  const { data, error } = await supabase.from("flights").select("*").eq("id", id).single();
  if (error) return demoFlights.find((flight) => flight.id === id) ?? null;
  return data;
}

export async function getSeats(flightId: string): Promise<Seat[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return buildDemoSeats(flightId);
  }

  const { data, error } = await supabase
    .from("seats")
    .select("*")
    .eq("flight_id", flightId)
    .order("seat_number", { ascending: true });

  if (error) return buildDemoSeats(flightId);
  return data ?? [];
}

export async function getBookings(): Promise<Booking[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoBookings;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*, flight:flights(*), seat:seats(*), passengers(*)")
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getBooking(id: string): Promise<Booking | null> {
  const bookings = await getBookings();
  return bookings.find((booking) => booking.id === id) ?? null;
}

function filterFlights(flights: Flight[], query?: Partial<SearchQuery>) {
  return flights.filter((flight) => {
    const originMatch = !query?.origin || flight.origin.toLowerCase() === query.origin.toLowerCase();
    const destinationMatch =
      !query?.destination || flight.destination.toLowerCase() === query.destination.toLowerCase();
    const dateMatch = !query?.date || flight.departs_at.slice(0, 10) === query.date;
    return originMatch && destinationMatch && dateMatch;
  });
}
