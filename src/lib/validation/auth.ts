import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Tell us what to call you").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
  timezone: z.string().trim().max(80).optional(),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const requestResetSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
export type RequestResetInput = z.infer<typeof requestResetSchema>;

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "At least 8 characters"),
});
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
