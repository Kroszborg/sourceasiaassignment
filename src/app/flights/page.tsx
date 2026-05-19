import Link from "next/link";
import { FlightCard } from "@/components/flight-card";
import { Button } from "@/components/ui/button";
import { getFlights } from "@/lib/data";
import type { SearchQuery } from "@/lib/types";

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<Partial<Record<keyof SearchQuery, string>>>;
}) {
  const params = await searchParams;
  const passengers = Number(params.passengers ?? 1);
  const flights = await getFlights({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    passengers,
  });

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Matching flights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {params.origin} to {params.destination} · {params.date} · {passengers} passenger{passengers === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Modify search</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} passengers={passengers} />
        ))}
        {!flights.length && (
          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No flights found</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try another route or date.</p>
          </div>
        )}
      </div>
    </main>
  );
}
