"use client";

import { UserRound } from "lucide-react";
import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useFlightStore } from "@/stores/flight-store";
import { useUserStore } from "@/stores/user-store";

export function SignOutForm() {
  const resetBooking = useFlightStore((state) => state.resetBooking);
  const resetUser = useUserStore((state) => state.resetUser);

  return (
    <form
      action={signOut}
      onSubmit={() => {
        resetBooking();
        resetUser();
      }}
    >
      <Button variant="outline" size="lg" type="submit">
        <UserRound aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}
