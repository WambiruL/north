import { z } from "zod";

/** A number input that's genuinely optional — an empty string stays empty instead of coercing to 0. */
export function optionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), schema.optional());
}
