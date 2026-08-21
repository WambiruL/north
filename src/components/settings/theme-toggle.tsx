"use client";

import { useState } from "react";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: MonitorSmartphone },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("north-theme") as Theme | null) ?? "system";
  });

  function apply(next: Theme) {
    setTheme(next);
    if (next === "system") {
      localStorage.removeItem("north-theme");
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem("north-theme", next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-[12px] bg-surface-2 p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => apply(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-[9px] px-3 py-1.5 text-[13px] font-semibold transition-colors",
            theme === value ? "bg-raise text-ink shadow-north-sm" : "text-muted",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
