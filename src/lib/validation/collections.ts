import { z } from "zod";

export const COLLECTION_ICON_SHAPES = ["circle", "ring", "square", "diamond"] as const;

export const collectionSchema = z.object({
  name: z.string().trim().min(1, "Give it a name").max(120),
  description: z.string().max(500).optional(),
  iconMark: z.enum(COLLECTION_ICON_SHAPES).default("circle"),
});
export type CollectionInput = z.infer<typeof collectionSchema>;
// Matches the resolver's pre-parse (defaulted fields optional) shape, so
// useForm<CollectionFormValues> lines up with zodResolver(collectionSchema)'s inferred type.
export type CollectionFormValues = z.input<typeof collectionSchema>;

export const COLLECTION_ITEM_PRIORITIES = ["low", "medium", "high"] as const;

export const collectionItemSchema = z.object({
  title: z.string().trim().min(1, "Give it a title").max(200),
  note: z.string().max(2000).optional(),
  url: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().url("Enter a valid URL").optional(),
  ),
  isDone: z.boolean().default(false),
  // No preprocess here (unlike `url` above): the dialog's Select always
  // resolves its "no priority" sentinel to `null` before it reaches RHF
  // state, so the value arriving here is already clean. Wrapping this in
  // z.preprocess would collapse the input type to `unknown` and break
  // inference for CollectionItemFormValues below.
  priority: z.enum(COLLECTION_ITEM_PRIORITIES).nullable().default(null),
});
export type CollectionItemInput = z.infer<typeof collectionItemSchema>;
// Matches the resolver's pre-parse (defaulted fields optional) shape, so
// useForm<CollectionItemFormValues> lines up with zodResolver(collectionItemSchema)'s inferred type.
export type CollectionItemFormValues = z.input<typeof collectionItemSchema>;
