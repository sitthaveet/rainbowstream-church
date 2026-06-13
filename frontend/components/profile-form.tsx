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
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" },
  { value: "intersex", label: "อินเตอร์เซ็กซ์" },
];

const ORIENTATION_OPTIONS: Array<{ value: OrientationValue; label: string }> = [
  { value: "gay_lesbian", label: "เกย์ / เลสเบี้ยน" },
  { value: "bisexual", label: "ไบเซ็กชวล" },
  { value: "straight", label: "สเตรท" },
  { value: "transgender", label: "คนข้ามเพศ" },
  { value: "other", label: "อื่น ๆ" },
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
    if (!firstName.trim()) errors.firstName = "กรุณากรอกชื่อจริง";
    if (!lastName.trim()) errors.lastName = "กรุณากรอกนามสกุล";
    if (!nickname.trim()) errors.nickname = "กรุณากรอกชื่อเล่น";
    if (orientation === "other" && !orientationOther.trim()) {
      errors.orientationOther = "กรุณาระบุอัตลักษณ์ของคุณ";
    }
    if (christianDuration !== "" && Number(christianDuration) < 0) {
      errors.christianDuration = "ต้องเป็นจำนวนปีตั้งแต่ 0 ขึ้นไป";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const patch: ProfilePatch = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nickname: nickname.trim(),
    };
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
        <Field label="ชื่อจริง" required error={fieldErrors.firstName}>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label="นามสกุล" required error={fieldErrors.lastName}>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label="ชื่อเล่น" required error={fieldErrors.nickname}>
        <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </Field>

      <Field label="วันเกิด">
        <Input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
      </Field>

      <Field label="อีเมล">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </Field>

      <Field label="เบอร์โทรศัพท์">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          autoComplete="tel"
        />
      </Field>

      <Field label="ที่อยู่">
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="เพศกำเนิด">
          <Select
            value={sexAtBirth}
            onChange={(e) => setSexAtBirth(e.target.value)}
          >
            <option value="">— เลือก —</option>
            {SEX_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="อัตลักษณ์ทางเพศ">
          <Select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
          >
            <option value="">— เลือก —</option>
            {ORIENTATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {orientation === "other" && (
        <Field label="ระบุอัตลักษณ์" required error={fieldErrors.orientationOther}>
          <Input
            value={orientationOther}
            onChange={(e) => setOrientationOther(e.target.value)}
          />
        </Field>
      )}

      <Field
        label="เป็นคริสเตียนมาแล้วกี่ปี"
        hint="ใส่ 0 หากยังไม่เป็นคริสเตียน"
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

      <Field label="คริสตจักรที่สังกัด">
        <Input value={church} onChange={(e) => setChurch(e.target.value)} />
      </Field>

      <Field label="แนะนำตัวเอง">
        <Textarea
          value={selfIntroduction}
          onChange={(e) => setSelfIntroduction(e.target.value)}
          rows={3}
          placeholder="เล่าให้เราฟังหน่อยว่าคุณเป็นใคร 💕"
        />
      </Field>

      {error && <Callout variant="error">{error}</Callout>}

      <Button type="submit" loading={saving} className="w-full" size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
