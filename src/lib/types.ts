export type FlightStatus = "scheduled" | "boarding" | "delayed" | "cancelled";
export type SeatClass = "first" | "business" | "economy";
export type BookingStatus = "confirmed" | "rescheduled" | "cancelled";
export type BookingStep = "search" | "flight" | "passengers" | "seat" | "confirm";

export type Flight = {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
};

export type Seat = {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
};

export type Passenger = {
  id?: string;
  booking_id?: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob?: string;
};

export type SafePassengerDraft = Omit<Passenger, "passport_no"> & {
  passport_no?: never;
};

export type Booking = {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  pnr_code: string;
  flight?: Flight;
  seat?: Seat;
  passengers?: Passenger[];
};

export type Reschedule = {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  requested_at: string;
  fee_charged: number;
};

export type SearchQuery = {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
};

export type BookingDraft = {
  flightId?: string;
  seatId?: string;
  passengers: Passenger[];
};

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };
