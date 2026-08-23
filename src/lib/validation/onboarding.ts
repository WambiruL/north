import { z } from "zod";

export const ONBOARDING_SEASONS = [
  "Building something new",
  "In transition",
  "Steady and growing",
  "Recovering",
  "Exploring",
  "Leading others",
  "Starting over",
] as const;

export const DREAM_SUGGESTIONS = [
  "Build a practice I'm proud of",
  "Get healthy and stay that way",
  "Buy a place of my own",
  "Learn something that scares me",
] as const;

export const onboardingSeasonsSchema = z.object({
  seasons: z.array(z.string()).max(ONBOARDING_SEASONS.length),
});
export type OnboardingSeasonsInput = z.infer<typeof onboardingSeasonsSchema>;

export const onboardingAreasSchema = z.object({
  spaceKeys: z.array(z.string()).max(20),
});
export type OnboardingAreasInput = z.infer<typeof onboardingAreasSchema>;

export const onboardingDreamSchema = z.object({
  title: z.string().trim().min(1, "Say it in one line").max(200),
});
export type OnboardingDreamInput = z.infer<typeof onboardingDreamSchema>;

export const onboardingCheckInSchema = z.object({
  mood: z.number().int().min(1).max(5),
  note: z.string().trim().max(500).optional(),
});
export type OnboardingCheckInInput = z.infer<typeof onboardingCheckInSchema>;

export const homeDensityValues = ["focused", "balanced", "full"] as const;
