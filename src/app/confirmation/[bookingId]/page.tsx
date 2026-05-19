import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBooking } from "@/lib/data";
import { currency, formatDateTime } from "@/lib/format";

export default async function ConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-10 sm:px-6">
      <Card className="w-full rounded-lg border-0 shadow-sm ring-1 ring-border">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Booking confirmed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {booking ? (
            <>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-xs text-muted-foreground">PNR code</p>
                <p className="text-3xl font-semibold tracking-widest">{booking.pnr_code}</p>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Flight" value={booking.flight?.flight_no ?? booking.flight_id} />
                <Info label="Route" value={`${booking.flight?.origin ?? ""} to ${booking.flight?.destination ?? ""}`} />
                <Info label="Departure" value={booking.flight ? formatDateTime(booking.flight.departs_at) : "Unknown"} />
                <Info label="Seat" value={booking.seat?.seat_number ?? "Assigned"} />
                <Info label="Passenger" value={booking.passengers?.[0]?.full_name ?? "Passenger"} />
                <Info label="Total" value={currency.format(booking.total_price)} />
              </div>
            </>
          ) : (
            <p className="rounded-md bg-muted p-4 text-center text-sm">
              Booking created. Sign in with Supabase credentials to view protected booking details.
            </p>
          )}
          <div className="flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">Search again</Link>
            </Button>
            <Button asChild>
              <Link href="/bookings">My bookings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
