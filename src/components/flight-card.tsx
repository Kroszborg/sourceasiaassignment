import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currency, durationLabel, formatTime } from "@/lib/format";
import type { Flight } from "@/lib/types";

export function FlightCard({ flight, passengers }: { flight: Flight; passengers: number }) {
  return (
    <Card className="rounded-lg border-0 shadow-sm ring-1 ring-border">
      <CardHeader className="gap-2 sm:grid-cols-[1fr_auto]">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            {flight.flight_no}
            <Badge variant={flight.status === "delayed" ? "destructive" : "secondary"}>{flight.status}</Badge>
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{flight.aircraft_type}</p>
        </div>
        <CardAction>
          <Button asChild size="lg">
            <Link href={`/book/${flight.id}?passengers=${passengers}`}>
              Select
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center">
          <div>
            <p className="text-xl font-semibold">{formatTime(flight.departs_at)}</p>
            <p className="text-sm text-muted-foreground">{flight.origin}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {durationLabel(flight)}
          </div>
          <div>
            <p className="text-xl font-semibold">{formatTime(flight.arrives_at)}</p>
            <p className="text-sm text-muted-foreground">{flight.destination}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-lg font-semibold">{currency.format(flight.base_price)}</p>
            <p className="text-xs text-muted-foreground">Base fare</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
