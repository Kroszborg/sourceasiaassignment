"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { airports } from "@/lib/demo-data";
import { useFlightStore } from "@/stores/flight-store";

export function SearchPanel() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useFlightStore();

  return (
    <Card className="w-full rounded-lg border-0 shadow-sm ring-1 ring-border">
      <CardHeader>
        <CardTitle className="text-base">Search flights</CardTitle>
        <CardDescription>Find available flights and continue to seat selection.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_150px_120px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const query = {
              origin: String(formData.get("origin")),
              destination: String(formData.get("destination")),
              date: String(formData.get("date")),
              passengers: Number(formData.get("passengers")),
            };
            setSearchQuery(query);
            router.push(
              `/flights?origin=${encodeURIComponent(query.origin)}&destination=${encodeURIComponent(query.destination)}&date=${query.date}&passengers=${query.passengers}`
            );
          }}
        >
          <label className="grid gap-1 text-xs font-medium">
            Origin
            <NativeSelect name="origin" defaultValue={searchQuery.origin} className="w-full">
              {airports.map((airport) => (
                <NativeSelectOption key={airport} value={airport}>
                  {airport}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Destination
            <NativeSelect name="destination" defaultValue={searchQuery.destination} className="w-full">
              {airports.map((airport) => (
                <NativeSelectOption key={airport} value={airport}>
                  {airport}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Date
            <Input type="date" name="date" defaultValue={searchQuery.date} min={new Date().toISOString().slice(0, 10)} />
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Passengers
            <Input type="number" name="passengers" min={1} max={6} defaultValue={searchQuery.passengers} />
          </label>
          <Button type="submit" size="lg" className="self-end">
            <Search aria-hidden="true" />
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
