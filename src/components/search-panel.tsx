"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, CalendarDays, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { airports, firstValidDestination, routesByOrigin } from "@/lib/demo-data";
import { useFlightStore } from "@/stores/flight-store";

export function SearchPanel() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useFlightStore();
  const [origin, setOrigin] = useState(searchQuery.origin);
  const [destination, setDestination] = useState(
    routesByOrigin[searchQuery.origin]?.includes(searchQuery.destination)
      ? searchQuery.destination
      : firstValidDestination(searchQuery.origin)
  );
  const destinations = useMemo(() => routesByOrigin[origin] ?? [], [origin]);

  return (
    <Card className="w-full rounded-lg border-0 bg-card/95 shadow-sm ring-1 ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="size-4" aria-hidden="true" />
          Search flights
        </CardTitle>
        <CardDescription>Pick a seeded direct route and continue to booking with live seat selection.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_150px_120px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const query = {
              origin,
              destination,
              date: String(formData.get("date")),
              passengers: Number(formData.get("passengers")),
            };
            setSearchQuery(query);
            router.push(
              `/flights?origin=${encodeURIComponent(query.origin)}&destination=${encodeURIComponent(query.destination)}&date=${query.date}&passengers=${query.passengers}`
            );
          }}
        >
          <label className="grid gap-1 text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ArrowRightLeft className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Origin
            </span>
            <NativeSelect
              name="origin"
              value={origin}
              onChange={(event) => {
                const nextOrigin = event.target.value;
                const nextDestination = firstValidDestination(nextOrigin);
                setOrigin(nextOrigin);
                setDestination(nextDestination);
              }}
              className="w-full"
            >
              {airports.map((airport) => (
                <NativeSelectOption key={airport} value={airport}>
                  {airport}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ArrowRightLeft className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Destination
            </span>
            <NativeSelect name="destination" value={destination} onChange={(event) => setDestination(event.target.value)} className="w-full">
              {destinations.map((airport) => (
                <NativeSelectOption key={airport} value={airport}>
                  {airport}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Date
            </span>
            <Input type="date" name="date" defaultValue={searchQuery.date} min={new Date().toISOString().slice(0, 10)} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
              Passengers
            </span>
            <Input type="number" name="passengers" min={1} max={6} defaultValue={searchQuery.passengers} />
          </label>
          <Button type="submit" size="lg" className="self-end sm:col-span-2 lg:col-span-1">
            <Search aria-hidden="true" />
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
