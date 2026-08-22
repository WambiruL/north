"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updatePreferences } from "@/server/actions/settings";
import type { PreferencesInput } from "@/lib/validation/settings";

const SWITCHES: { key: keyof PreferencesInput; label: string; desc: string }[] = [
  {
    key: "openCheckInAfterSignIn",
    label: "Open today's check-in after signing in",
    desc: "Skip the dashboard and land straight on the check-in page.",
  },
  {
    key: "showSeasonCard",
    label: "Show the season card on the dashboard",
    desc: "The highlighted focus banner near the top of your dashboard.",
  },
  {
    key: "reduceMotion",
    label: "Reduce motion",
    desc: "Turn off hover and entrance animations across North.",
  },
];

export function PreferencesCard({ preferences }: { preferences: PreferencesInput }) {
  const router = useRouter();
  const [values, setValues] = useState(preferences);
  const [isPending, startTransition] = useTransition();

  function toggle(key: keyof PreferencesInput) {
    const next = { ...values, [key]: !values[key] };
    setValues(next);
    startTransition(async () => {
      const result = await updatePreferences(next);
      if (result?.error) {
        toast.error(result.error);
        setValues(values);
        return;
      }
      if (key === "reduceMotion") {
        document.documentElement.setAttribute("data-reduce-motion", String(next.reduceMotion));
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications and privacy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
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
