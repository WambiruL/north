import { z } from "zod";

export const travelStatuses = ["been", "want_to_go"] as const;

export const travelEntrySchema = z.object({
  title: z.string().min(1, "Where is this?").max(200),
  status: z.enum(travelStatuses).default("want_to_go"),
  location: z.string().max(200).optional(),
  reason: z.string().max(400).optional(),
  notes: z.string().max(4000).optional(),
  occurredOn: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).default([]),
});
export type TravelEntryInput = z.infer<typeof travelEntrySchema>;
