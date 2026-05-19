import Link from "next/link";
import { Plane, TicketCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutForm } from "@/components/sign-out-form";
import { AuthSessionSync } from "@/components/auth-session-sync";

export async function AppNav() {
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <AuthSessionSync accessToken={session?.access_token} email={user?.email} />
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Plane className="size-4" aria-hidden="true" />
          </span>
          <span>Source Asia Air</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="lg">
            <Link href="/bookings">
              <TicketCheck aria-hidden="true" />
              My bookings
            </Link>
          </Button>
          {user ? (
            <SignOutForm />
          ) : (
            <Button asChild size="lg">
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
