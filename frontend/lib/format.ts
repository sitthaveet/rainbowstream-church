/** Thai-locale date/time formatting (`th-TH` uses the Buddhist calendar —
 *  พ.ศ. — by default, matching how members read dates) and other shared
 *  display formatting. */

/** "ชื่อ นามสกุล (ชื่อเล่น)" with graceful fallbacks for partly-filled
 *  profiles; unregistered users show as "ยังไม่ได้ลงทะเบียน". */
export function displayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (name && user.nickname) return `${name} (${user.nickname})`;
  return name || user.nickname || "ยังไม่ได้ลงทะเบียน";
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
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(
    new Date(iso),
  );
}

export function formatThaiDateTime(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatThaiTime(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", { timeStyle: "short" }).format(
    new Date(iso),
  );
}

/** "12 มิ.ย. 2569 10:00 – 12:00" or just the start when no end is set. */
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
