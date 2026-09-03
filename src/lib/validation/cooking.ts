import { z } from "zod";
import { optionalNumber } from "@/lib/validation/shared";

export const recipeStatuses = ["want_to_try", "made"] as const;

export const recipeSchema = z.object({
  name: z.string().min(1, "Give it a name").max(200),
  photoUrl: z.string().max(2000).optional().nullable(),
  ingredients: z.string().max(6000).optional(),
  method: z.string().max(8000).optional(),
  prepMinutes: optionalNumber(z.coerce.number().int().min(0)).nullable(),
  cookMinutes: optionalNumber(z.coerce.number().int().min(0)).nullable(),
  notes: z.string().max(4000).optional(),
  rating: optionalNumber(z.coerce.number().int().min(1).max(5)).nullable(),
  status: z.enum(recipeStatuses).default("want_to_try"),
});
export type RecipeInput = z.infer<typeof recipeSchema>;

export const cookingLogSchema = z.object({
  dishName: z.string().min(1, "What did you make?").max(200),
  photoUrl: z.string().max(2000).optional().nullable(),
  recipeId: z.string().uuid().optional().nullable(),
  occurredOn: z.string().min(1, "Pick a date"),
  rating: optionalNumber(z.coerce.number().int().min(1).max(5)).nullable(),
  note: z.string().max(2000).optional(),
});
export type CookingLogInput = z.infer<typeof cookingLogSchema>;
