"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plane, TicketCheck, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SignOutForm } from "@/components/sign-out-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUserStore } from "@/stores/user-store";

export function AppNav() {
  const [user, setUser] = useState<User | null>(null);
  const setSession = useUserStore((state) => state.setSession);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSession(data.session ? { accessToken: data.session.access_token, email: data.session.user.email } : null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(session ? { accessToken: session.access_token, email: session.user.email } : null);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Plane className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate">Source Asia Air</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="lg" className="px-2 sm:px-2.5">
            <Link href="/bookings">
              <TicketCheck aria-hidden="true" />
              <span className="hidden sm:inline">My bookings</span>
            </Link>
          </Button>
          <ThemeToggle />
          {user ? (
            <SignOutForm />
          ) : (
            <Button asChild size="lg" className="px-2 sm:px-2.5">
              <Link href="/auth">
                <UserRound aria-hidden="true" />
                Sign in
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
