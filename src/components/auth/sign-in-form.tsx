"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";
import { signIn } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInInput) {
    setServerError(null);
    const result = await signIn(values);
    if (result?.error) setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-[13.5px] text-muted">Sign in to pick up where you left off.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-[12px] text-mahogany">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/reset-password" className="text-[12px] font-semibold text-teal hover:underline">
            Forgot?
          </Link>
        </div>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-[12px] text-mahogany">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-[13px] text-mahogany">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-[13px] text-muted">
        New to North?{" "}
        <Link href="/sign-up" className="font-semibold text-teal hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
