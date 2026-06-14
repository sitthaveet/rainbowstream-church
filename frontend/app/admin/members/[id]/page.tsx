"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { RequirePastor } from "@/components/guard";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import {
  getUser,
  listUserCheckins,
  updateRole,
  deleteMember,
  errorMessage,
  type ApiUser,
} from "@/lib/client";
import { formatThaiDate, formatThaiDateTime } from "@/lib/format";

const SEX_LABELS: Record<string, string> = {
  male: "ชาย",
  female: "หญิง",
  intersex: "อินเตอร์เซ็กซ์",
};

const ORIENTATION_LABELS: Record<string, string> = {
  gay_lesbian: "เกย์ / เลสเบี้ยน",
  bisexual: "ไบเซ็กชวล",
  straight: "สเตรท",
  transgender: "คนข้ามเพศ",
  other: "อื่น ๆ",
};

export default function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RequirePastor>
      <MemberDetailContent id={id} />
    </RequirePastor>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}

function MemberDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { user: me } = useAuth();
  const memberQ = useApi(() => getUser(id), [id]);
  const checkinsQ = useApi(() => listUserCheckins(id), [id]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (memberQ.isLoading) return <PageSpinner />;
  if (memberQ.error || !memberQ.data) {
    return <Callout variant="error">{errorMessage(memberQ.error)}</Callout>;
  }

  const member: ApiUser = memberQ.data.user;
  const checkins = checkinsQ.data?.checkins ?? [];
  const isSelf = me!.id === member.id;
  const fullName =
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    "ยังไม่ได้ลงทะเบียน";

  const handleRoleToggle = async () => {
    const nextRole = member.role === "pastor" ? "member" : "pastor";
    const label =
      nextRole === "pastor"
        ? `แต่งตั้ง ${fullName} เป็นศิษยาภิบาล?`
        : `ถอด ${fullName} จากศิษยาภิบาลเป็นสมาชิกทั่วไป?`;
    if (!window.confirm(label)) return;
    setBusy(true);
    setActionError(null);
    try {
      await updateRole(id, nextRole);
      await memberQ.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `ลบสมาชิก "${fullName}"? ข้อมูลและประวัติเช็คอินทั้งหมดจะถูกลบถาวร`,
      )
    ) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await deleteMember(id);
      router.replace("/admin/members");
    } catch (err) {
      setActionError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={member.role === "pastor" ? "ศิษยาภิบาล" : "สมาชิก"}
        title={member.nickname || fullName}
      >
        แต้มสะสม{" "}
        <span className="font-sans font-semibold text-headings">
          {member.points}
        </span>{" "}
        แต้ม
      </PageHeader>

      <Card>
        <h2 className="mb-2 text-lg">ข้อมูลส่วนตัว</h2>
        <ProfileRow label="ชื่อ-นามสกุล" value={fullName} />
        <ProfileRow label="ชื่อเล่น" value={member.nickname} />
        <ProfileRow
          label="วันเกิด"
          value={member.birthdate ? formatThaiDate(member.birthdate) : null}
        />
        <ProfileRow label="อีเมล" value={member.email} />
        <ProfileRow label="เบอร์โทรศัพท์" value={member.phoneNumber} />
        <ProfileRow label="ที่อยู่" value={member.address} />
        <ProfileRow
          label="เพศกำเนิด"
          value={member.sexAtBirth ? SEX_LABELS[member.sexAtBirth] : null}
        />
        <ProfileRow
          label="อัตลักษณ์ทางเพศ"
          value={
            member.identityOrientation === "other"
              ? member.identityOrientationOther
              : member.identityOrientation
                ? ORIENTATION_LABELS[member.identityOrientation]
                : null
          }
        />
        <ProfileRow
          label="เป็นคริสเตียนมาแล้ว"
          value={
            member.christianDuration != null
              ? member.christianDuration === 0
                ? "ยังไม่เป็นคริสเตียน"
                : `${member.christianDuration} ปี`
              : null
          }
        />
        <ProfileRow label="คริสตจักรที่สังกัด" value={member.church} />
        <ProfileRow label="แนะนำตัว" value={member.selfIntroduction} />
        <ProfileRow label="เข้าร่วมเมื่อ" value={formatThaiDate(member.createdAt)} />
      </Card>

      <section>
        <h2 className="text-2xl">
          ประวัติเช็คอิน{" "}
          <span className="text-muted-foreground">({checkins.length})</span>
        </h2>
        <div className="mt-4 space-y-3">
          {checkinsQ.isLoading ? (
            <PageSpinner />
          ) : checkins.length === 0 ? (
            <Card className="text-center text-sm text-muted-foreground">
              ยังไม่มีประวัติเช็คอิน
            </Card>
          ) : (
            checkins.map((c) => (
              <Card key={c.id} className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate font-sans">{c.event.title}</p>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {formatThaiDateTime(c.checkedInAt)}
                </p>
              </Card>
            ))
          )}
        </div>
      </section>

      {actionError && <Callout variant="error">{actionError}</Callout>}

      <section className="space-y-3 border-t pt-6">
        <Button
          variant="outline"
          className="w-full"
          loading={busy}
          onClick={handleRoleToggle}
        >
          {member.role === "pastor"
            ? "ถอดจากศิษยาภิบาล"
            : "แต่งตั้งเป็นศิษยาภิบาล"}
        </Button>
        {!isSelf && (
          <Button
            variant="destructive"
            className="w-full"
            loading={busy}
            onClick={handleDelete}
          >
            ลบสมาชิก
          </Button>
        )}
      </section>
    </div>
  );
}
