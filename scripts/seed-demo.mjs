import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function loadEnvFile() {
  if (!fs.existsSync(".env")) return;
  const env = fs.readFileSync(".env", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!process.env[key]) process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const email = process.env.SEED_USER_EMAIL || "test.passenger@example.com";
const password = process.env.SEED_USER_PASSWORD || "SourceAsia123!";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = new Date();
function iso(dayOffset, hour, minute = 0) {
  const date = new Date(now);
  date.setDate(now.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const flights = [
  ["SA 204", "Delhi", "Mumbai", iso(1, 8, 15), iso(1, 10, 25), "Airbus A320neo", "scheduled", 8200],
  ["SA 418", "Delhi", "Mumbai", iso(1, 17, 40), iso(1, 19, 55), "Boeing 737 MAX", "scheduled", 9100],
  ["SA 512", "Mumbai", "Bengaluru", iso(1, 9, 0), iso(1, 10, 50), "Airbus A321", "boarding", 7600],
  ["SA 734", "Mumbai", "Bengaluru", iso(2, 15, 10), iso(2, 17, 0), "Airbus A320neo", "scheduled", 7000],
  ["SA 860", "Bengaluru", "Kolkata", iso(1, 6, 30), iso(1, 9, 5), "Boeing 737-800", "scheduled", 9800],
  ["SA 944", "Bengaluru", "Kolkata", iso(3, 20, 15), iso(3, 22, 45), "Airbus A320neo", "delayed", 8900],
  ["SA 118", "Hyderabad", "Delhi", iso(2, 7, 20), iso(2, 9, 45), "Airbus A321", "scheduled", 8700],
  ["SA 326", "Hyderabad", "Delhi", iso(4, 13, 5), iso(4, 15, 35), "Boeing 737 MAX", "scheduled", 8300],
].map(([flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price]) => ({
  flight_no,
  origin,
  destination,
  departs_at,
  arrives_at,
  aircraft_type,
  status,
  base_price,
}));

const { data: upsertedFlights, error: flightError } = await supabase
  .from("flights")
  .upsert(flights, { onConflict: "flight_no" })
  .select("id, flight_no");

if (flightError) {
  console.error(flightError.message);
  process.exit(1);
}

const letters = ["A", "B", "C", "D", "E", "F"];
const seats = [];
for (const flight of upsertedFlights ?? []) {
  for (let row = 1; row <= 18; row++) {
    for (const letter of letters) {
      const seat_number = `${row}${letter}`;
      const seatClass = row <= 2 ? "first" : row <= 6 ? "business" : "economy";
      seats.push({
        flight_id: flight.id,
        seat_number,
        class: seatClass,
        is_available: !["1A", "3C", "7D", "12F", "15B"].includes(seat_number),
        extra_fee: seatClass === "first" ? 6200 : seatClass === "business" ? 2800 : row <= 9 ? 450 : 0,
      });
    }
  }
}

const { error: seatError } = await supabase.from("seats").upsert(seats, { onConflict: "flight_id,seat_number" });
if (seatError) {
  console.error(seatError.message);
  process.exit(1);
}

const { error: userError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (userError && !userError.message.toLowerCase().includes("already")) {
  console.error(userError.message);
  process.exit(1);
}

console.log(`Seeded ${flights.length} flights and ${seats.length} seats.`);
console.log(`Test user ready: ${email}`);
console.log(`Password: ${password}`);
