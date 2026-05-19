import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  PlaneTakeoff,
  ShieldCheck,
  Smartphone,
  Timer,
  Wifi,
} from "lucide-react";
import { SearchPanel } from "@/components/search-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoFlights } from "@/lib/demo-data";
import { currency, formatTime } from "@/lib/format";

export default function Home() {
  const featuredFlights = demoFlights.slice(0, 3);

  return (
    <main className="flex w-full flex-1 flex-col">
      <section className="border-b bg-[radial-gradient(circle_at_top_left,oklch(0.88_0.08_185_/_0.45),transparent_34%),linear-gradient(180deg,var(--background),var(--muted))]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-12">
          <div className="space-y-6">
            <Badge variant="outline" className="bg-background/70">
              Flight Management PWA
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-balance sm:text-5xl">
                Search flights, reserve seats, and manage bookings in one polished flow.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Built for the internship brief with Supabase Auth, RLS, realtime seat updates, atomic booking RPCs, rescheduling, cancellation protection, Zustand persistence, and PWA support.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg">
                <Link href="#search">
                  Search flights
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth">Use demo account</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Seeded flights" value="8" />
              <Stat label="Seat inventory" value="864" />
              <Stat label="Routes" value="4" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg bg-primary/10" />
            <Card className="relative overflow-hidden rounded-lg border-0 shadow-xl ring-1 ring-border">
              <CardHeader className="border-b bg-card/80">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PlaneTakeoff className="size-4" aria-hidden="true" />
                  Operations board
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {featuredFlights.map((flight) => (
                  <div key={flight.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border bg-background/70 p-3">
                    <div>
                      <p className="font-semibold">{flight.flight_no}</p>
                      <p className="text-xs text-muted-foreground">
                        {flight.origin} to {flight.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatTime(flight.departs_at)}</p>
                      <p className="text-xs text-muted-foreground">{currency.format(flight.base_price)}</p>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <MiniStatus icon={<ShieldCheck className="size-3.5" />} label="RLS" />
                  <MiniStatus icon={<Wifi className="size-3.5" />} label="Realtime" />
                  <MiniStatus icon={<Timer className="size-3.5" />} label="Atomic" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="search" className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
        <SearchPanel />

        <div className="grid gap-3 md:grid-cols-3">
          <Metric icon={<ShieldCheck className="size-4" />} title="Protected bookings" text="RLS keeps each passenger scoped to their own booking data." />
          <Metric icon={<Activity className="size-4" />} title="Live cabin map" text="Seats update through Supabase Realtime after another passenger books." />
          <Metric icon={<Smartphone className="size-4" />} title="Installable PWA" text="Includes manifest, install prompt, route caching, and offline fallback." />
        </div>

        <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="rounded-lg border-0 ring-1 ring-border">
            <CardHeader>
              <CardTitle className="text-base">Demo credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">Use these on the auth page to test protected booking flows.</p>
              <div className="rounded-lg bg-muted p-3 font-mono text-xs">
                <p>test.passenger@example.com</p>
                <p>SourceAsia123!</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth">Open auth page</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-0 ring-1 ring-border">
            <CardHeader>
              <CardTitle className="text-base">Implemented checklist</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              {["Search and booking", "Realtime seat selection", "Reschedule and cancel", "Supabase Auth", "RLS migrations", "Zustand persist", "PWA manifest", "Offline fallback"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniStatus({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

function Metric({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card className="rounded-lg border-0 bg-muted/50 ring-1 ring-border">
      <CardHeader className="flex-row items-center gap-2 pb-0">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
