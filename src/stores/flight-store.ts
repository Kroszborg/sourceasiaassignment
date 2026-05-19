"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingStep, Passenger, SafePassengerDraft, SearchQuery } from "@/lib/types";

type FlightState = {
  searchQuery: SearchQuery;
  selectedFlightId?: string;
  selectedSeatId?: string;
  currentStep: BookingStep;
  passengerDrafts: SafePassengerDraft[];
  setSearchQuery: (query: SearchQuery) => void;
  selectFlight: (flightId: string) => void;
  selectSeat: (seatId: string) => void;
  setStep: (step: BookingStep) => void;
  setPassengerDrafts: (passengers: Passenger[]) => void;
  resetBooking: () => void;
};

const defaultQuery: SearchQuery = {
  origin: "Delhi",
  destination: "Mumbai",
  date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  passengers: 1,
};

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      searchQuery: defaultQuery,
      currentStep: "search",
      passengerDrafts: [],
      setSearchQuery: (query) => set({ searchQuery: query, currentStep: "flight" }),
      selectFlight: (flightId) => set({ selectedFlightId: flightId, selectedSeatId: undefined, currentStep: "passengers" }),
      selectSeat: (seatId) => set({ selectedSeatId: seatId, currentStep: "confirm" }),
      setStep: (step) => set({ currentStep: step }),
      setPassengerDrafts: (passengers) =>
        set({
          passengerDrafts: passengers.map((passenger) => {
            const { full_name, nationality, dob, id, booking_id } = passenger;
            return { full_name, nationality, dob, id, booking_id };
          }),
          currentStep: "seat",
        }),
      resetBooking: () =>
        set({
          selectedFlightId: undefined,
          selectedSeatId: undefined,
          currentStep: "search",
          passengerDrafts: [],
        }),
    }),
    {
      name: "source-asia-flight-store",
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlightId: state.selectedFlightId,
        selectedSeatId: state.selectedSeatId,
        currentStep: state.currentStep,
        passengerDrafts: state.passengerDrafts,
      }),
    }
  )
);
