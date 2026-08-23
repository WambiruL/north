const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();
const hourFormatterCache = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(timezone: string) {
  let formatter = dateFormatterCache.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dateFormatterCache.set(timezone, formatter);
  }
  return formatter;
}

function hourFormatter(timezone: string) {
  let formatter = hourFormatterCache.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    hourFormatterCache.set(timezone, formatter);
  }
  return formatter;
}

/** "yyyy-MM-dd" for the given instant, as a wall-clock date in `timezone`. */
export function dateISOInTimezone(timezone: string, at: Date = new Date()): string {
  try {
    return dateFormatter(timezone).format(at);
  } catch {
    return at.toISOString().slice(0, 10);
  }
}

/** Hour of day (0-23) for the given instant, as wall-clock time in `timezone`. */
export function hourInTimezone(timezone: string, at: Date = new Date()): number {
  try {
    const part = hourFormatter(timezone).formatToParts(at).find((p) => p.type === "hour")?.value;
    return part ? parseInt(part, 10) % 24 : at.getUTCHours();
  } catch {
    return at.getUTCHours();
  }
}

/** "yyyy-MM-dd" for `days` days before the given instant's wall-clock date in `timezone`. */
export function dateISODaysAgoInTimezone(timezone: string, days: number, from: Date = new Date()): string {
  const todayStr = dateISOInTimezone(timezone, from);
  const anchor = new Date(`${todayStr}T12:00:00Z`);
  anchor.setUTCDate(anchor.getUTCDate() - days);
  return anchor.toISOString().slice(0, 10);
}

/** "yyyy-MM-01" for the wall-clock month containing the given instant in `timezone`. */
export function monthStartISOInTimezone(timezone: string, from: Date = new Date()): string {
  return `${dateISOInTimezone(timezone, from).slice(0, 7)}-01`;
}

/** "Sunday, 23 August" for the given instant, as a wall-clock date in `timezone`. */
export function longDateInTimezone(timezone: string, at: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(at);
  } catch {
    return at.toDateString();
  }
}

/** Best-effort IANA timezone name for whoever is running this code right now. */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** True if `timezone` is a real IANA identifier Intl can resolve. */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
