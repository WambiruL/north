"use client";

import { cn } from "@/lib/utils";

const ENERGY_LABELS: Record<number, string> = {
  1: "Drained",
  2: "Low",
  3: "Steady",
  4: "Good",
  5: "Full",
};

export interface EnergyDotsProps {
  value: number;
  onChange: (value: number) => void;
}

export function EnergyDots({ value, onChange }: EnergyDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Energy ${n} of 5`}
          aria-pressed={n <= value}
          onClick={() => onChange(n)}
          className={cn(
            "h-3.5 w-3.5 rounded-full border-2 border-teal transition-colors",
            n <= value ? "bg-teal" : "bg-transparent",
          )}
        />
      ))}
      <span className="ml-2 text-[14px] font-semibold text-muted">{ENERGY_LABELS[value]}</span>
    </div>
  );
}
