import { z } from "zod";
import { isValidTimezone } from "@/lib/timezone";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Tell us what to call you").max(120),
  headline: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  currency: z.string().trim().min(1).max(10),
  timezone: z.string().trim().min(1).max(80).refine(isValidTimezone, "Not a recognized timezone"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const preferencesSchema = z.object({
  reduceMotion: z.boolean(),
  openCheckInAfterSignIn: z.boolean(),
  showSeasonCard: z.boolean(),
});
export type PreferencesInput = z.infer<typeof preferencesSchema>;

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "KES", "NGN", "ZAR", "INR", "BRL", "CAD", "AUD"] as const;
