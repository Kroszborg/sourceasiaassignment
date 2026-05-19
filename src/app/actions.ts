"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { pnrCode } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authSchema, bookingSchema } from "@/lib/validation";
import type { ActionResult, Booking } from "@/lib/types";

export async function signIn(formData: FormData) {
  const parsed = authSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/auth?error=Enter a valid email and password.");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/bookings");
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/bookings");
}

export async function signUp(formData: FormData) {
  const parsed = authSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/auth?error=Enter a valid email and password.");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/bookings");
  }

  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/bookings");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function createBooking(input: z.infer<typeof bookingSchema>): Promise<ActionResult<{ bookingId: string }>> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Check passenger details and seat selection." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured. Add .env.local credentials to create real bookings." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "Sign in before booking a flight." };
  }

  const { data, error } = await supabase.rpc("reserve_seat_and_create_booking", {
    p_flight_id: parsed.data.flight_id,
    p_seat_id: parsed.data.seat_id,
    p_passengers: parsed.data.passengers,
    p_pnr_code: pnrCode(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/bookings");
  return { ok: true, data: { bookingId: String(data) } };
}

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/bookings");
  return { ok: true, data: null };
}

export async function rescheduleBooking(bookingId: string, newFlightId: string): Promise<ActionResult<Booking>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const { data, error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/bookings");
  return { ok: true, data: data as Booking };
}
