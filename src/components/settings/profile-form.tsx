"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput, CURRENCIES } from "@/lib/validation/settings";
import { updateProfile } from "@/server/actions/settings";
import { detectTimezone } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import type { Tables } from "@/types/database.types";

const TIMEZONES: string[] =
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];

export function ProfileForm({ profile }: { profile: Tables<"profiles"> }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name,
      headline: profile.headline ?? "",
      city: profile.city ?? "",
      currency: profile.currency,
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
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-[12px] text-mahogany">{errors.fullName.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="headline">What you do</Label>
          <Input id="headline" placeholder="Product designer, going independent" {...register("headline")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Lisbon" {...register("city")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="timezone">Timezone</Label>
          <div className="flex gap-2">
            <Input
              id="timezone"
              list="timezone-options"
              placeholder="Europe/Lisbon"
              autoComplete="off"
              {...register("timezone")}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => setValue("timezone", detectTimezone(), { shouldValidate: true })}
            >
              Detect
            </Button>
          </div>
          <datalist id="timezone-options">
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
          {errors.timezone && <p className="text-[12px] text-mahogany">{errors.timezone.message}</p>}
        </div>
      </div>

      <Button type="submit" variant="accent" disabled={submitting} className="self-start">
        {submitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
