"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Booking } from "@/lib/types";

type CachedSession = {
  accessToken?: string;
  email?: string;
};

type UserState = {
  session: CachedSession | null;
  cachedBookings: Booking[];
  setSession: (session: CachedSession | null) => void;
  setCachedBookings: (bookings: Booking[]) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      session: null,
      cachedBookings: readCachedBookings(),
      setSession: (session) => set({ session }),
      setCachedBookings: (bookings) => {
        writeCachedBookings(bookings);
        set({ cachedBookings: bookings });
      },
      resetUser: () => {
        writeCachedBookings([]);
        set({ session: null, cachedBookings: [] });
      },
    }),
    {
      name: "source-asia-user-store",
      partialize: (state) => ({
        session: state.session,
      }),
    }
  )
);

function readCachedBookings() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem("source-asia-bookings-cache") ?? "[]") as Booking[];
  } catch {
    return [];
  }
}

function writeCachedBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("source-asia-bookings-cache", JSON.stringify(bookings));
}
