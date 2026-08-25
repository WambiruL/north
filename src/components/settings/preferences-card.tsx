"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { updatePreferences } from "@/server/actions/settings";
import { homeDensityValues, type PreferencesInput } from "@/lib/validation/settings";

const SWITCHES: { key: "openCheckInAfterSignIn" | "reduceMotion"; label: string; desc: string }[] = [
  {
    key: "openCheckInAfterSignIn",
    label: "Open today's check-in after signing in",
    desc: "Skip the dashboard and land straight on the check-in page.",
  },
  {
    key: "reduceMotion",
    label: "Reduce motion",
    desc: "Turn off hover and entrance animations across North.",
  },
];

const DENSITY_LABELS: Record<(typeof homeDensityValues)[number], { label: string; desc: string }> = {
  focused: { label: "Focused", desc: "Just your check-in and today's priorities." },
  balanced: { label: "Balanced", desc: "Adds the life snapshot tiles." },
  full: { label: "Full", desc: "Everything, including recent activity and wins." },
};

export function PreferencesCard({ preferences }: { preferences: PreferencesInput }) {
  const router = useRouter();
  const [values, setValues] = useState(preferences);
  const [isPending, startTransition] = useTransition();

  function save(next: PreferencesInput) {
    setValues(next);
    startTransition(async () => {
      const result = await updatePreferences(next);
      if (result?.error) {
        toast.error(result.error);
        setValues(values);
        return;
      }
      if (next.reduceMotion !== values.reduceMotion) {
        document.documentElement.setAttribute("data-reduce-motion", String(next.reduceMotion));
      }
      router.refresh();
    });
  }

  function toggle(key: (typeof SWITCHES)[number]["key"]) {
    save({ ...values, [key]: !values[key] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications and privacy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex items-center gap-5 border-b border-line-2 py-5">
          <div className="flex-1">
            <div className="mb-0.5 text-[15.5px] font-bold text-ink">How the home page should feel</div>
            <div className="text-[13.5px] text-muted">{DENSITY_LABELS[values.homeDensity].desc}</div>
          </div>
          <div className="flex shrink-0 gap-1 rounded-[11px] bg-surface-2 p-1">
            {homeDensityValues.map((density) => (
              <button
                key={density}
                type="button"
                disabled={isPending}
                onClick={() => save({ ...values, homeDensity: density })}
                className={cn(
                  "rounded-[8px] px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                  values.homeDensity === density ? "bg-raise text-ink shadow-north-sm" : "text-muted",
                )}
              >
                {DENSITY_LABELS[density].label}
              </button>
            ))}
          </div>
        </div>
        {SWITCHES.map((sw) => (
          <div key={sw.key} className="flex items-center gap-5 border-b border-line-2 py-5 last:border-0 last:pb-0">
            <div className="flex-1">
              <div className="mb-0.5 text-[15.5px] font-bold text-ink">{sw.label}</div>
              <div className="text-[13.5px] text-muted">{sw.desc}</div>
            </div>
            <Switch checked={values[sw.key]} onCheckedChange={() => toggle(sw.key)} disabled={isPending} label={sw.label} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
