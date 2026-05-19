import { BookingsManager } from "@/components/bookings-manager";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBookings, getFlights } from "@/lib/data";
import Link from "next/link";

export default async function BookingsPage() {
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const [bookings, flights] = await Promise.all([getBookings(), getFlights()]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user ? user.email : "Demo data is shown until Supabase auth is configured or you sign in."}
          </p>
        </div>
        {!user && (
          <Button asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
        )}
      </div>
      <BookingsManager bookings={bookings} flights={flights} />
    </main>
  );
}
