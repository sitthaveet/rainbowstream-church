/** Thai-locale date/time formatting. `th-TH` uses the Buddhist calendar
 *  (พ.ศ.) by default, matching how members read dates. */

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
