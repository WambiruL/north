"use client";

import { cn } from "@/lib/utils";
import { MOOD_LEVELS } from "@/lib/constants/mood";

const TONE_CLASS: Record<string, string> = {
  mahogany: "data-[active=true]:bg-mahogany-soft data-[active=true]:border-mahogany data-[active=true]:text-mahogany",
  teal: "data-[active=true]:bg-teal-soft data-[active=true]:border-teal data-[active=true]:text-teal",
  amber: "data-[active=true]:bg-amber-soft data-[active=true]:border-amber data-[active=true]:text-amber",
};

const DOT_TONE: Record<string, string> = {
  mahogany: "bg-mahogany",
  teal: "bg-teal",
  amber: "bg-amber",
};

export interface MoodPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_LEVELS.map((mood) => {
        const active = value === mood.value;
        return (
          <button
            key={mood.value}
            type="button"
            data-active={active}
            aria-pressed={active}
            onClick={() => onChange(mood.value)}
            className={cn(
              "flex items-center gap-2 rounded-full border border-line bg-raise px-4 py-2 text-[13.5px] font-semibold text-muted transition-colors",
              TONE_CLASS[mood.tone],
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", active ? DOT_TONE[mood.tone] : "bg-faint")} />
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
