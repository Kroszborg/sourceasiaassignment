"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarClock, RotateCcw, XCircle } from "lucide-react";
import { cancelBooking, rescheduleBooking } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { currency, formatDateTime } from "@/lib/format";
import type { Booking, Flight } from "@/lib/types";
import { useUserStore } from "@/stores/user-store";
import { useFlightStore } from "@/stores/flight-store";

export function BookingsManager({ bookings, flights }: { bookings: Booking[]; flights: Flight[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { cachedBookings, setCachedBookings } = useUserStore();
  const resetBooking = useFlightStore((state) => state.resetBooking);

  useEffect(() => {
    if (bookings.length) setCachedBookings(bookings);
  }, [bookings, setCachedBookings]);

  const visibleBookings = bookings.length ? bookings : cachedBookings;

  if (!visibleBookings.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">No bookings yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Search for a flight and create your first booking.</p>
        <Button asChild className="mt-4" size="lg">
          <Link href="/">Search flights</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && <p className="rounded-md bg-muted p-3 text-sm">{message}</p>}
      {!bookings.length && cachedBookings.length > 0 && (
        <p className="rounded-md bg-muted p-3 text-sm">Showing last cached bookings for offline reading.</p>
      )}
      {visibleBookings.map((booking) => {
        const sameRouteFlights = flights.filter(
          (flight) =>
            booking.flight &&
            flight.id !== booking.flight_id &&
            flight.origin === booking.flight.origin &&
            flight.destination === booking.flight.destination
        );

        return (
          <Card key={booking.id} className="rounded-lg border-0 shadow-sm ring-1 ring-border">
            <CardHeader className="sm:grid-cols-[1fr_auto]">
              <div>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  PNR {booking.pnr_code}
                  <Badge variant={booking.status === "cancelled" ? "destructive" : "secondary"}>{booking.status}</Badge>
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {booking.flight?.flight_no} · {booking.flight?.origin} to {booking.flight?.destination}
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <Info label="Departure" value={booking.flight ? formatDateTime(booking.flight.departs_at) : "Unknown"} />
                <Info label="Seat" value={booking.seat?.seat_number ?? "Unassigned"} />
                <Info label="Paid" value={currency.format(booking.total_price)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={booking.status === "cancelled" || sameRouteFlights.length === 0}>
                      <RotateCcw aria-hidden="true" />
                      Reschedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reschedule booking</DialogTitle>
                      <DialogDescription>Choose another flight on the same route. Any fare increase is recorded as a fee.</DialogDescription>
                    </DialogHeader>
                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const newFlightId = String(formData.get("flight_id"));
                        startTransition(async () => {
                          const result = await rescheduleBooking(booking.id, newFlightId);
                          setMessage(result.ok ? "Booking rescheduled." : result.error);
                        });
                      }}
                    >
                      <NativeSelect name="flight_id" className="w-full">
                        {sameRouteFlights.map((flight) => (
                          <NativeSelectOption key={flight.id} value={flight.id}>
                            {flight.flight_no} · {formatDateTime(flight.departs_at)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" type="button">
                            Close
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                          <CalendarClock aria-hidden="true" />
                          Confirm
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={booking.status === "cancelled"}>
                      <XCircle aria-hidden="true" />
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel booking</DialogTitle>
                      <DialogDescription>This frees the seat atomically. The database rejects cancellation within 2 hours of departure.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Keep booking</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            const result = await cancelBooking(booking.id);
                            if (result.ok) resetBooking();
                            setMessage(result.ok ? "Booking cancelled." : result.error);
                          })
                        }
                      >
                        Confirm cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
