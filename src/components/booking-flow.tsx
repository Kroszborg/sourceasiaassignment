"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createBooking } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SeatMap } from "@/components/seat-map";
import { currency, formatDateTime } from "@/lib/format";
import type { Flight, Passenger, Seat } from "@/lib/types";
import { useFlightStore } from "@/stores/flight-store";

export function BookingFlow({
  flight,
  seats,
  passengerCount,
}: {
  flight: Flight;
  seats: Seat[];
  passengerCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: passengerCount }, () => ({
      full_name: "",
      passport_no: "",
      nationality: "Indian",
      dob: "",
    }))
  );
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const { selectFlight, setPassengerDrafts, resetBooking } = useFlightStore();

  const total = useMemo(() => flight.base_price + (selectedSeat?.extra_fee ?? 0), [flight.base_price, selectedSeat]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <Card className="rounded-lg border-0 shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-base">Passenger details</CardTitle>
            <CardDescription>Passport numbers are sent to Supabase for booking only and are excluded from persisted drafts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passengers.map((passenger, index) => (
              <div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                <p className="font-medium sm:col-span-2">Passenger {index + 1}</p>
                <label className="grid gap-1 text-xs font-medium">
                  Full name
                  <Input
                    value={passenger.full_name}
                    onChange={(event) => updatePassenger(index, "full_name", event.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium">
                  Passport number
                  <Input
                    value={passenger.passport_no}
                    onChange={(event) => updatePassenger(index, "passport_no", event.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium">
                  Nationality
                  <Input
                    value={passenger.nationality}
                    onChange={(event) => updatePassenger(index, "nationality", event.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium">
                  Date of birth
                  <Input value={passenger.dob} type="date" onChange={(event) => updatePassenger(index, "dob", event.target.value)} />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0 shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-base">Seat selection</CardTitle>
            <CardDescription>Seat availability updates live when Supabase Realtime is configured.</CardDescription>
          </CardHeader>
          <CardContent>
            <SeatMap
              flightId={flight.id}
              initialSeats={seats}
              onSeatChange={(seat) => {
                selectFlight(flight.id);
                setPassengerDrafts(passengers);
                setSelectedSeat(seat);
              }}
            />
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card className="rounded-lg border-0 shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-base">{flight.flight_no}</CardTitle>
            <CardDescription>
              {flight.origin} to {flight.destination}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">{formatDateTime(flight.departs_at)}</p>
              <p className="text-muted-foreground">{flight.aircraft_type}</p>
            </div>
            <div className="flex justify-between text-sm">
              <span>Base fare</span>
              <span>{currency.format(flight.base_price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Seat fee</span>
              <span>{currency.format(selectedSeat?.extra_fee ?? 0)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{currency.format(total)}</span>
            </div>
            {selectedSeat && <p className="text-xs text-muted-foreground">Selected seat {selectedSeat.seat_number}</p>}
            {error && <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}
            <Button
              className="w-full"
              size="lg"
              disabled={isPending || !selectedSeat}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await createBooking({
                    flight_id: flight.id,
                    seat_id: selectedSeat!.id,
                    passengers,
                  });
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  resetBooking();
                  router.push(`/confirmation/${result.data.bookingId}`);
                });
              }}
            >
              <CheckCircle2 aria-hidden="true" />
              {isPending ? "Confirming..." : "Confirm booking"}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );

  function updatePassenger(index: number, field: keyof Passenger, value: string) {
    setPassengers((current) => current.map((passenger, currentIndex) => (currentIndex === index ? { ...passenger, [field]: value } : passenger)));
  }
}
