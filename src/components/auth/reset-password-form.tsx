"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestResetSchema, type RequestResetInput } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetInput>({ resolver: zodResolver(requestResetSchema) });

  async function onSubmit(values: RequestResetInput) {
    setServerError(null);
    const result = await requestPasswordReset(values);
    if (result?.error) setServerError(result.error);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-[22px] font-bold tracking-tight text-ink">Check your email</h1>
        <p className="text-[13.5px] text-muted">
          If an account exists for that address, a reset link is on its way.
        </p>
        <Link href="/sign-in" className="mt-2 text-[13px] font-semibold text-teal hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-ink">Reset your password</h1>
        <p className="mt-1 text-[13.5px] text-muted">We&apos;ll email you a link to choose a new one.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-[12px] text-mahogany">{errors.email.message}</p>}
      </div>

      {serverError && <p className="text-[13px] text-mahogany">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-[13px] text-muted">
        <Link href="/sign-in" className="font-semibold text-teal hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
