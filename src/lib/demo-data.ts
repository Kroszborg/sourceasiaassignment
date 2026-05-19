import type { Booking, Flight, Passenger, Seat } from "@/lib/types";

const today = new Date();
const iso = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date(today);
  date.setDate(today.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const demoFlights: Flight[] = [
  {
    id: "flt-del-bom-1",
    flight_no: "SA 204",
    origin: "Delhi",
    destination: "Mumbai",
    departs_at: iso(1, 8, 15),
    arrives_at: iso(1, 10, 25),
    aircraft_type: "Airbus A320neo",
    status: "scheduled",
    base_price: 8200,
  },
  {
    id: "flt-del-bom-2",
    flight_no: "SA 418",
    origin: "Delhi",
    destination: "Mumbai",
    departs_at: iso(1, 17, 40),
    arrives_at: iso(1, 19, 55),
    aircraft_type: "Boeing 737 MAX",
    status: "scheduled",
    base_price: 9100,
  },
  {
    id: "flt-bom-blr-1",
    flight_no: "SA 512",
    origin: "Mumbai",
    destination: "Bengaluru",
    departs_at: iso(1, 9, 0),
    arrives_at: iso(1, 10, 50),
    aircraft_type: "Airbus A321",
    status: "boarding",
    base_price: 7600,
  },
  {
    id: "flt-bom-blr-2",
    flight_no: "SA 734",
    origin: "Mumbai",
    destination: "Bengaluru",
    departs_at: iso(2, 15, 10),
    arrives_at: iso(2, 17, 0),
    aircraft_type: "Airbus A320neo",
    status: "scheduled",
    base_price: 7000,
  },
  {
    id: "flt-blr-ccu-1",
    flight_no: "SA 860",
    origin: "Bengaluru",
    destination: "Kolkata",
    departs_at: iso(1, 6, 30),
    arrives_at: iso(1, 9, 5),
    aircraft_type: "Boeing 737-800",
    status: "scheduled",
    base_price: 9800,
  },
  {
    id: "flt-blr-ccu-2",
    flight_no: "SA 944",
    origin: "Bengaluru",
    destination: "Kolkata",
    departs_at: iso(3, 20, 15),
    arrives_at: iso(3, 22, 45),
    aircraft_type: "Airbus A320neo",
    status: "delayed",
    base_price: 8900,
  },
  {
    id: "flt-hyd-del-1",
    flight_no: "SA 118",
    origin: "Hyderabad",
    destination: "Delhi",
    departs_at: iso(2, 7, 20),
    arrives_at: iso(2, 9, 45),
    aircraft_type: "Airbus A321",
    status: "scheduled",
    base_price: 8700,
  },
  {
    id: "flt-hyd-del-2",
    flight_no: "SA 326",
    origin: "Hyderabad",
    destination: "Delhi",
    departs_at: iso(4, 13, 5),
    arrives_at: iso(4, 15, 35),
    aircraft_type: "Boeing 737 MAX",
    status: "scheduled",
    base_price: 8300,
  },
];

export const airports = Array.from(
  new Set(demoFlights.flatMap((flight) => [flight.origin, flight.destination]))
).sort();

export function buildDemoSeats(flightId: string): Seat[] {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const seats: Seat[] = [];

  for (let row = 1; row <= 18; row++) {
    for (const letter of letters) {
      const seatClass = row <= 2 ? "first" : row <= 6 ? "business" : "economy";
      const id = `${flightId}-${row}${letter}`;
      seats.push({
        id,
        flight_id: flightId,
        seat_number: `${row}${letter}`,
        class: seatClass,
        is_available: !["1A", "3C", "7D", "12F", "15B"].includes(`${row}${letter}`),
        extra_fee: seatClass === "first" ? 6200 : seatClass === "business" ? 2800 : row <= 9 ? 450 : 0,
      });
    }
  }

  return seats;
}

const demoPassenger: Passenger = {
  full_name: "Demo Passenger",
  passport_no: "P0000000",
  nationality: "Indian",
  dob: "1998-01-01",
};

export const demoBookings: Booking[] = [
  {
    id: "bk-demo-001",
    user_id: "demo-user",
    flight_id: demoFlights[0].id,
    seat_id: `${demoFlights[0].id}-8A`,
    status: "confirmed",
    booked_at: iso(-1, 14, 20),
    total_price: 8650,
    pnr_code: "SA9K2P",
    flight: demoFlights[0],
    seat: buildDemoSeats(demoFlights[0].id).find((seat) => seat.seat_number === "8A"),
    passengers: [demoPassenger],
  },
];
