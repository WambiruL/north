"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validation/settings";
import { updateProfile } from "@/server/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/types/database.types";

export function ProfileForm({ profile }: { profile: Tables<"profiles"> }) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name,
      city: profile.city ?? "",
      timezone: profile.timezone,
    },
  });

  async function onSubmit(values: ProfileInput) {
    setSubmitting(true);
    const result = await updateProfile(values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Name</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && <p className="text-[12px] text-mahogany">{errors.fullName.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input id="city" placeholder="Lisbon" {...register("city")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <Input id="timezone" placeholder="Europe/Lisbon" {...register("timezone")} />
      </div>

      <Button type="submit" variant="accent" disabled={submitting} className="self-start">
        {submitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
