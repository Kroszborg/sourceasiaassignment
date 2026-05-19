import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking-flow";
import { getFlight, getSeats } from "@/lib/data";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ flightId: string }>;
  searchParams: Promise<{ passengers?: string }>;
}) {
  const [{ flightId }, query] = await Promise.all([params, searchParams]);
  const flight = await getFlight(flightId);

  if (!flight) {
    notFound();
  }

  const seats = await getSeats(flightId);
  const passengerCount = Math.min(Math.max(Number(query.passengers ?? 1), 1), 6);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Complete booking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {flight.flight_no} · {flight.origin} to {flight.destination}
        </p>
      </div>
      <BookingFlow flight={flight} seats={seats} passengerCount={passengerCount} />
    </main>
  );
}
