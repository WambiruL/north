"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { detectTimezone } from "@/lib/timezone";
import { syncTimezone } from "@/server/actions/settings";

/**
 * Renders nothing. Runs once per mount: if this account is still on the
 * unconfigured "UTC" default and the browser reports a real timezone,
 * save it silently so dates and "today" line up with where the person
 * actually is.
 */
export function TimezoneSync({ currentTimezone }: { currentTimezone: string }) {
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    if (currentTimezone !== "UTC") return;

    const detected = detectTimezone();
    if (detected === "UTC") return;

    syncTimezone(detected).then((result) => {
      if (!result?.error) router.refresh();
    });
  }, [currentTimezone, router]);

  return null;
}
