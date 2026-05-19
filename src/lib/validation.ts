import { z } from "zod";

export const searchSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  date: z.string().min(10),
  passengers: z.coerce.number().int().min(1).max(6),
});

export const passengerSchema = z.object({
  full_name: z.string().min(2, "Enter the passenger name."),
  passport_no: z.string().min(6, "Enter a valid passport number."),
  nationality: z.string().min(2, "Enter nationality."),
  dob: z.string().optional(),
});

export const bookingSchema = z.object({
  flight_id: z.string().min(1),
  seat_id: z.string().min(1),
  passengers: z.array(passengerSchema).min(1).max(6),
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
