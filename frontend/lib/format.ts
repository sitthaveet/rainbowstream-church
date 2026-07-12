/** Thai-locale date/time formatting and other shared display formatting. */

/** Thai month/time names, but Gregorian years (ค.ศ.). Plain `th-TH` would
 *  default to the Buddhist calendar (พ.ศ. — 543 years ahead), so every date
 *  formatter below must go through this locale. */
const THAI_LOCALE = "th-TH-u-ca-gregory";

/** "ชื่อ นามสกุล (ชื่อเล่น)" with graceful fallbacks for partly-filled
 *  profiles. The default fallback reads "not yet registered" (right for the
 *  admin screens); pass one where that's misleading — e.g. the leaderboard
 *  only lists registered users, who may still have left every name blank. */
export function displayName(
  user: {
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
  },
  fallback = "ยังไม่ได้ลงทะเบียน",
): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (name && user.nickname) return `${name} (${user.nickname})`;
  return name || user.nickname || fallback;
}

/** True while an event counts as upcoming: it has not yet ended as of `refMs`
 *  (falling back to its start when it has no end time). Callers pick the
 *  cutoff — exact now, or local midnight to keep today's events listed. */
export function isUpcomingEvent(
  event: { startsAt: string; endsAt?: string | null },
  refMs: number,
): boolean {
  return Date.parse(event.endsAt ?? event.startsAt) >= refMs;
}

export function formatThaiDate(iso: string): string {
  return new Intl.DateTimeFormat(THAI_LOCALE, { dateStyle: "long" }).format(
    new Date(iso),
  );
}

export function formatThaiDateTime(iso: string): string {
  return new Intl.DateTimeFormat(THAI_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatThaiTime(iso: string): string {
  return new Intl.DateTimeFormat(THAI_LOCALE, { timeStyle: "short" }).format(
    new Date(iso),
  );
}

/** "12 มิ.ย. 2026 10:00 – 12:00" or just the start when no end is set. */
export function formatEventRange(startsAt: string, endsAt?: string | null): string {
  const start = formatThaiDateTime(startsAt);
  if (!endsAt) return start;
  const sameDay =
    new Date(startsAt).toDateString() === new Date(endsAt).toDateString();
  return sameDay
    ? `${start} – ${formatThaiTime(endsAt)}`
    : `${start} – ${formatThaiDateTime(endsAt)}`;
}

/** ISO string → value for an `<input type="datetime-local">` (local time). */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** `<input type="datetime-local">` value → ISO string (UTC). */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
