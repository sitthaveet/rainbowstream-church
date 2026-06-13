"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/format";
import { errorMessage, type EventDetail, type EventInput } from "@/lib/client";

/**
 * Create/edit form for events. The API uses PUT semantics (every field sent
 * on each save), which this form satisfies by always submitting the full
 * object. Mirrors the server's createEventSchema checks client-side.
 */
export function EventForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: EventDetail;
  submitLabel: string;
  onSubmit: (input: EventInput) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [startsAt, setStartsAt] = useState(
    initial ? toDatetimeLocalValue(initial.startsAt) : "",
  );
  const [endsAt, setEndsAt] = useState(
    initial?.endsAt ? toDatetimeLocalValue(initial.endsAt) : "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "กรุณากรอกชื่อกิจกรรม";
    if (!startsAt) errors.startsAt = "กรุณาเลือกวันเวลาเริ่ม";
    if (startsAt && endsAt && new Date(endsAt) < new Date(startsAt)) {
      errors.endsAt = "เวลาสิ้นสุดต้องไม่ก่อนเวลาเริ่ม";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const input: EventInput = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      startsAt: fromDatetimeLocalValue(startsAt),
      endsAt: endsAt ? fromDatetimeLocalValue(endsAt) : null,
    };

    setSaving(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="ชื่อกิจกรรม" required error={fieldErrors.title}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น สามัคคีธรรมประจำเดือน"
        />
      </Field>

      <Field label="รายละเอียด">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </Field>

      <Field label="สถานที่">
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </Field>

      <Field label="เริ่มวันที่/เวลา" required error={fieldErrors.startsAt}>
        <Input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </Field>

      <Field label="สิ้นสุดวันที่/เวลา" error={fieldErrors.endsAt}>
        <Input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
      </Field>

      {error && <Callout variant="error">{error}</Callout>}

      <Button type="submit" loading={saving} className="w-full" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
