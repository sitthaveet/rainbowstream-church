/**
 * Removes `checkinCode` from an event payload. `ListEvents`/`GetEventById`
 * select `checkinCode` (it is the QR-code secret); only pastors may see it,
 * so non-pastor responses are stripped before serialization.
 */
export function stripCheckinCode<T extends { checkinCode?: unknown }>(
  event: T,
): Omit<T, "checkinCode"> {
  const copy = { ...event };
  delete (copy as { checkinCode?: unknown }).checkinCode;
  return copy;
}
