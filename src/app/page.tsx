import { Activity, ShieldCheck, Smartphone } from "lucide-react";
import { SearchPanel } from "@/components/search-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-5">
          <Badge variant="outline">Flight Management PWA</Badge>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-balance sm:text-5xl">
              Book, manage, and reschedule flights with live seat availability.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              A production-style internship assignment built with Next.js App Router, Supabase, realtime seat maps, RLS, atomic booking RPCs, Zustand persistence, and PWA support.
            </p>
          </div>
        </div>
        <div className="grid gap-3">
          <Metric icon={<ShieldCheck className="size-4" />} title="RLS protected" text="Bookings stay scoped to each authenticated user." />
          <Metric icon={<Activity className="size-4" />} title="Realtime seats" text="Seat updates stream from Supabase when configured." />
          <Metric icon={<Smartphone className="size-4" />} title="Installable" text="Manifest, offline fallback, and install prompt included." />
        </div>
      </section>

      <SearchPanel />
    </main>
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
