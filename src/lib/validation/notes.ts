import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().max(200).default(""),
  body: z.string().max(20000).default(""),
  pinned: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});
export type NoteInput = z.infer<typeof noteSchema>;
// Matches the resolver's pre-parse (defaulted fields optional) shape, so
// useForm<NoteFormValues> lines up with zodResolver(noteSchema)'s inferred type.
export type NoteFormValues = z.input<typeof noteSchema>;
