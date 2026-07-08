"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  updateProfile,
  errorMessage,
  type ApiUser,
  type ProfilePatch,
  type OrientationValue,
  type SexAtBirthValue,
} from "@/lib/client";

const SEX_OPTIONS: Array<{ value: SexAtBirthValue; label: string }> = [
  { value: "male", label: "ชาย · Male" },
  { value: "female", label: "หญิง · Female" },
  { value: "intersex", label: "อินเตอร์เซ็กซ์ · Intersex" },
];

const ORIENTATION_OPTIONS: Array<{ value: OrientationValue; label: string }> = [
  { value: "gay_lesbian", label: "เกย์ / เลสเบี้ยน · Gay / Lesbian" },
  { value: "bisexual", label: "ไบเซ็กชวล · Bisexual" },
  { value: "straight", label: "สเตรท · Straight" },
  { value: "transgender", label: "คนข้ามเพศ · Transgender" },
  { value: "other", label: "อื่น ๆ · Other" },
];

/**
 * Registration + profile-edit form (PATCH /api/users/[id]). Only filled
 * fields are sent — the server merges partially. Note: a previously saved
 * field cannot be cleared back to empty (server-side merge limitation).
 */
export function ProfileForm({
  user,
  submitLabel,
  onSaved,
}: {
  user: ApiUser;
  submitLabel: string;
  onSaved: (user: ApiUser) => void | Promise<void>;
}) {
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [nickname, setNickname] = useState(user.nickname ?? "");
  const [birthdate, setBirthdate] = useState(user.birthdate ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [sexAtBirth, setSexAtBirth] = useState<string>(user.sexAtBirth ?? "");
  const [orientation, setOrientation] = useState<string>(
    user.identityOrientation ?? "",
  );
  const [orientationOther, setOrientationOther] = useState(
    user.identityOrientationOther ?? "",
  );
  const [christianDuration, setChristianDuration] = useState(
    user.christianDuration != null ? String(user.christianDuration) : "",
  );
  const [church, setChurch] = useState(user.church ?? "");
  const [selfIntroduction, setSelfIntroduction] = useState(
    user.selfIntroduction ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};
    if (orientation === "other" && !orientationOther.trim()) {
      errors.orientationOther = "กรุณาระบุอัตลักษณ์ของคุณ";
    }
    if (christianDuration !== "" && Number(christianDuration) < 0) {
      errors.christianDuration = "ต้องเป็นจำนวนปีตั้งแต่ 0 ขึ้นไป";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const patch: ProfilePatch = {};
    if (firstName.trim()) patch.firstName = firstName.trim();
    if (lastName.trim()) patch.lastName = lastName.trim();
    if (nickname.trim()) patch.nickname = nickname.trim();
    if (birthdate) patch.birthdate = birthdate;
    if (email.trim()) patch.email = email.trim();
    if (phoneNumber.trim()) patch.phoneNumber = phoneNumber.trim();
    if (address.trim()) patch.address = address.trim();
    if (sexAtBirth) patch.sexAtBirth = sexAtBirth as SexAtBirthValue;
    if (orientation) {
      patch.identityOrientation = orientation as OrientationValue;
      if (orientation === "other") {
        patch.identityOrientationOther = orientationOther.trim();
      }
    }
    if (christianDuration !== "") {
      patch.christianDuration = Math.floor(Number(christianDuration));
    }
    if (church.trim()) patch.church = church.trim();
    if (selfIntroduction.trim()) patch.selfIntroduction = selfIntroduction.trim();

    setSaving(true);
    try {
      const { user: saved } = await updateProfile(user.id, patch);
      await onSaved(saved);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ชื่อจริง" sublabel="First name" error={fieldErrors.firstName}>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label="นามสกุล" sublabel="Last name" error={fieldErrors.lastName}>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label="ชื่อเล่น" sublabel="Nickname" error={fieldErrors.nickname}>
        <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </Field>

      <Field label="วันเกิด" sublabel="Date of birth">
        <Input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
      </Field>

      <Field label="อีเมล" sublabel="Email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </Field>

      <Field label="เบอร์โทรศัพท์" sublabel="Phone number">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          autoComplete="tel"
        />
      </Field>

      <Field label="ที่อยู่" sublabel="Address">
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="เพศกำเนิด" sublabel="Sex at birth">
          <Select
            value={sexAtBirth}
            onChange={(e) => setSexAtBirth(e.target.value)}
          >
            <option value="">— เลือก · Select —</option>
            {SEX_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="อัตลักษณ์ทางเพศ" sublabel="Gender identity">
          <Select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
          >
            <option value="">— เลือก · Select —</option>
            {ORIENTATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {orientation === "other" && (
        <Field
          label="ระบุอัตลักษณ์"
          sublabel="Please specify"
          required
          error={fieldErrors.orientationOther}
        >
          <Input
            value={orientationOther}
            onChange={(e) => setOrientationOther(e.target.value)}
          />
        </Field>
      )}

      <Field
        label="เป็นคริสเตียนมาแล้วกี่ปี"
        sublabel="How many years u became Christian"
        hint="ใส่ 0 หากยังไม่เป็นคริสเตียน · Enter 0 if not yet a Christian"
        error={fieldErrors.christianDuration}
      >
        <Input
          type="number"
          min={0}
          step={1}
          value={christianDuration}
          onChange={(e) => setChristianDuration(e.target.value)}
        />
      </Field>

      <Field label="คริสตจักรที่สังกัด" sublabel="Church">
        <Input value={church} onChange={(e) => setChurch(e.target.value)} />
      </Field>

      <Field label="แนะนำตัวเอง" sublabel="Introduce yourself">
        <Textarea
          value={selfIntroduction}
          onChange={(e) => setSelfIntroduction(e.target.value)}
          rows={3}
          placeholder="เล่าให้เราฟังหน่อยว่าคุณเป็นใคร · Tell us about yourself 💕"
        />
      </Field>

      {error && <Callout variant="error">{error}</Callout>}

      <Button type="submit" loading={saving} className="w-full" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
