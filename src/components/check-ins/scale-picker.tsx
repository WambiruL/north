"use client";

import { cn } from "@/lib/utils";

const LABELS: Record<number, string> = { 1: "Low", 2: "", 3: "Okay", 4: "", 5: "High" };

export interface ScalePickerProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tone?: "teal" | "amber" | "mahogany";
}

export function ScalePicker({ label, value, onChange, tone = "teal" }: ScalePickerProps) {
  const toneClass = {
    teal: "data-[active=true]:bg-teal data-[active=true]:border-teal",
    amber: "data-[active=true]:bg-amber data-[active=true]:border-amber",
    mahogany: "data-[active=true]:bg-mahogany data-[active=true]:border-mahogany",
  }[tone];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold tracking-wide text-muted">{label}</span>
        <span className="text-[11px] text-faint">{LABELS[value]}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            data-active={value === n}
            onClick={() => onChange(n)}
            aria-label={`${label} ${n} of 5`}
            aria-pressed={value === n}
            className={cn(
              "h-9 flex-1 rounded-[9px] border border-line bg-raise text-[13px] font-bold text-faint transition-colors data-[active=true]:text-white",
              toneClass,
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
