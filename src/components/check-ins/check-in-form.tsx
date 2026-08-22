"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  checkInSchema,
  type CheckInInput,
  type CheckInFormInput,
} from "@/lib/validation/check-ins";
import { saveCheckIn } from "@/server/actions/check-ins";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MoodPicker } from "@/components/check-ins/mood-picker";
import { EnergyDots } from "@/components/check-ins/energy-dots";
import type { Tables } from "@/types/database.types";

type CheckIn = Tables<"check_ins">;

function toDefaults(entryDate: string, checkIn?: CheckIn | null): CheckInInput {
  if (checkIn) {
    return {
      entryDate: checkIn.entry_date,
      mood: checkIn.mood,
      energy: checkIn.energy,
      sleepHours: checkIn.sleep_hours ?? undefined,
      intention: checkIn.intention ?? undefined,
      feeling: checkIn.feeling ?? undefined,
      challenge: checkIn.challenge ?? undefined,
      grateful: checkIn.grateful ?? undefined,
      mattersTomorrow: checkIn.matters_tomorrow ?? undefined,
      tags: checkIn.tags,
    };
  }
  return {
    entryDate,
    mood: 3,
    energy: 3,
    sleepHours: undefined,
    intention: "",
    feeling: "",
    challenge: "",
    grateful: "",
    mattersTomorrow: "",
    tags: [],
  };
}

const FIELDS: { key: keyof CheckInInput; label: string; rows: number; placeholder?: string }[] = [
  { key: "feeling", label: "How am I feeling today?", rows: 3, placeholder: "Write freely. Nobody reads this but you." },
  { key: "challenge", label: "What challenged me?", rows: 2 },
  { key: "grateful", label: "What am I grateful for?", rows: 2 },
  { key: "mattersTomorrow", label: "What matters tomorrow?", rows: 2 },
];

export function CheckInForm({
  entryDate,
  isToday,
  checkIn,
}: {
  entryDate: string;
  isToday: boolean;
  checkIn: CheckIn | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control } = useForm<
    CheckInFormInput,
    unknown,
    CheckInInput
  >({
    resolver: zodResolver(checkInSchema),
    values: toDefaults(entryDate, checkIn),
  });

  async function onSubmit(values: CheckInInput) {
    setSubmitting(true);
    const result = await saveCheckIn(values);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(checkIn ? "Check-in updated" : "Checked in");
    router.refresh();
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7" noValidate>
        <div>
          <div className="mb-4 text-[11px] font-bold uppercase tracking-wider text-faint">
            How is the day sitting
          </div>
          <Controller
            control={control}
            name="mood"
            render={({ field }) => <MoodPicker value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className="flex flex-wrap gap-10 border-b border-line-2 pb-6">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Energy</span>
            <Controller
              control={control}
              name="energy"
              render={({ field }) => <EnergyDots value={field.value} onChange={field.onChange} />}
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Sleep</span>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                {...register("sleepHours")}
                className="h-10 w-16 rounded-[11px] border border-line bg-surface-2 px-3 text-[16px] font-bold text-ink outline-none focus-visible:border-teal"
              />
              <span className="text-[14px] font-semibold text-muted">hours</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">One word for today</span>
            <input
              {...register("intention")}
              placeholder="steady"
              className="h-10 w-[150px] rounded-[11px] border border-line bg-surface-2 px-3 text-[15px] font-semibold text-ink outline-none focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal-soft"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-2 block text-[17px] font-bold text-ink">{field.label}</span>
              <Textarea
                rows={field.rows}
                placeholder={field.placeholder}
                {...register(field.key as "feeling" | "challenge" | "grateful" | "mattersTomorrow")}
                className="rounded-[14px] bg-surface-2 text-[15.5px]"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-[13px] bg-teal px-6 py-3.5 text-[15px] font-extrabold text-[#FFECD1] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? "Saving…" : checkIn ? "Save changes" : isToday ? "Save today's check-in" : "Save this entry"}
          </button>
          <span className="text-[13.5px] text-muted">Only you can see this.</span>
        </div>
      </form>
    </Card>
  );
}
