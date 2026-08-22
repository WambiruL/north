"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const OPTIONS: {
  value: Theme;
  name: string;
  description: string;
  bg: string;
  border: string;
  surface: string;
}[] = [
  {
    value: "light",
    name: "Cream",
    description: "Paper, for daylight and writing",
    bg: "#F2E8D6",
    border: "rgba(120,41,15,.16)",
    surface: "#FFF9EF",
  },
  {
    value: "dark",
    name: "Midnight",
    description: "Navy, for evenings and check-ins",
    bg: "#001524",
    border: "rgba(255,236,209,.14)",
    surface: "#04202C",
  },
];

export function AppearanceCard() {
  const [theme, setTheme] = useState<Theme | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("north-theme") as Theme | null) ?? null;
  });

  function pick(next: Theme) {
    setTheme(next);
    localStorage.setItem("north-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => pick(option.value)}
                className={cn(
                  "rounded-[16px] border p-3.5 text-left transition-colors",
                  active ? "border-teal" : "border-line",
                )}
              >
                <div
                  className="flex h-[72px] items-end gap-1.5 rounded-[12px] border p-3"
                  style={{ backgroundColor: option.bg, borderColor: option.border }}
                >
                  <span className="h-[34px] flex-1 rounded-[7px]" style={{ backgroundColor: option.surface }} />
                  <span className="h-[22px] w-[26px] rounded-[7px] bg-teal" />
                  <span className="h-[14px] w-[14px] rounded-[5px] bg-amber" />
                </div>
                <div className="mt-3.5 flex items-center justify-between">
                  <span className="text-[15.5px] font-bold text-ink">{option.name}</span>
                  {active && (
                    <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-[11px] font-bold text-teal">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[13px] text-muted">{option.description}</div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
