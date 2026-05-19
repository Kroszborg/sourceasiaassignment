"use client";

import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { currency } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Seat } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFlightStore } from "@/stores/flight-store";

export function SeatMap({
  initialSeats,
  flightId,
  onSeatChange,
}: {
  initialSeats: Seat[];
  flightId: string;
  onSeatChange?: (seat: Seat) => void;
}) {
  const [seats, setSeats] = useState(initialSeats);
  const { selectedSeatId, selectSeat } = useFlightStore();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`seats:${flightId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seats", filter: `flight_id=eq.${flightId}` },
        (payload) => {
          const nextSeat = payload.new as Seat;
          setSeats((current) => current.map((seat) => (seat.id === nextSeat.id ? nextSeat : seat)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flightId]);

  const rows = useMemo(() => {
    const byRow = new Map<string, Seat[]>();
    for (const seat of seats) {
      const row = seat.seat_number.match(/^\d+/)?.[0] ?? seat.seat_number;
      byRow.set(row, [...(byRow.get(row) ?? []), seat]);
    }
    return Array.from(byRow.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [seats]);

  return (
    <TooltipProvider>
      <div className="overflow-x-auto rounded-lg border bg-card p-3">
        <div className="min-w-[420px] space-y-2">
          <div className="grid grid-cols-[36px_repeat(3,34px)_24px_repeat(3,34px)] gap-1 text-center text-[0.625rem] text-muted-foreground">
            <span />
            <span>A</span>
            <span>B</span>
            <span>C</span>
            <span />
            <span>D</span>
            <span>E</span>
            <span>F</span>
          </div>
          {rows.map(([row, rowSeats]) => (
            <div key={row}>
              {row === "1" && <CabinLabel label="First" />}
              {row === "3" && <CabinLabel label="Business" />}
              {row === "7" && <CabinLabel label="Economy" />}
              <div className="grid grid-cols-[36px_repeat(3,34px)_24px_repeat(3,34px)] gap-1">
                <span className="flex items-center justify-center text-xs text-muted-foreground">{row}</span>
                {rowSeats.slice(0, 3).map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    selected={selectedSeatId === seat.id}
                    onSelect={(nextSeat) => {
                      selectSeat(nextSeat.id);
                      onSeatChange?.(nextSeat);
                    }}
                  />
                ))}
                <span />
                {rowSeats.slice(3, 6).map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    selected={selectedSeatId === seat.id}
                    onSelect={(nextSeat) => {
                      selectSeat(nextSeat.id);
                      onSeatChange?.(nextSeat);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend className="bg-emerald-100 ring-emerald-300" label="Available" />
          <Legend className="bg-sky-600 ring-sky-700" label="Selected" />
          <Legend className="bg-zinc-200 ring-zinc-300" label="Occupied" />
        </div>
      </div>
    </TooltipProvider>
  );
}

function CabinLabel({ label }: { label: string }) {
  return <div className="py-2 text-center text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>;
}

function SeatButton({
  seat,
  selected,
  onSelect,
}: {
  seat: Seat;
  selected: boolean;
  onSelect: (seat: Seat) => void;
}) {
  const disabled = !seat.is_available;
  const className = cn(
    "h-8 rounded-md text-[0.625rem] font-semibold ring-1 transition",
    seat.class === "first" && "border-t-2 border-t-amber-500",
    seat.class === "business" && "border-t-2 border-t-indigo-500",
    seat.class === "economy" && "border-t-2 border-t-emerald-500",
    selected && "bg-sky-600 text-white ring-sky-700",
    !selected && !disabled && "bg-emerald-100 text-emerald-950 ring-emerald-300 hover:bg-emerald-200",
    disabled && "cursor-not-allowed bg-zinc-200 text-zinc-500 ring-zinc-300"
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" disabled={disabled} className={className} onClick={() => onSelect(seat)}>
          {seat.seat_number}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {seat.class} {seat.extra_fee > 0 ? `+ ${currency.format(seat.extra_fee)}` : "included"}
      </TooltipContent>
    </Tooltip>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("size-3 rounded-sm ring-1", className)} />
      {label}
    </span>
  );
}
