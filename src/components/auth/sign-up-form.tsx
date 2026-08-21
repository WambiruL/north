"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";
import { signUp } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpInput) {
    setServerError(null);
    const result = await signUp(values);
    if (result?.error) setServerError(result.error);
    else if ("needsConfirmation" in result && result.needsConfirmation) {
      setNeedsConfirmation(true);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-[22px] font-bold tracking-tight text-ink">Check your email</h1>
        <p className="text-[13.5px] text-muted">
          We&apos;ve sent a confirmation link. Follow it to activate your account, then sign in.
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
        <h1 className="text-[24px] font-bold tracking-tight text-ink">Start building</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          One place for the life you&apos;re building, not just the tasks in it.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Name</Label>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
        {errors.fullName && <p className="text-[12px] text-mahogany">{errors.fullName.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-[12px] text-mahogany">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-[12px] text-mahogany">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-[13px] text-mahogany">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-teal hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
