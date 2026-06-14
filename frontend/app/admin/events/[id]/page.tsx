"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useLIFF } from "@/providers/liff-providers";
import { RequirePastor } from "@/components/guard";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import {
  getEvent,
  listEventCheckins,
  deleteEvent,
  errorMessage,
  type EventCheckin,
} from "@/lib/client";
import { formatEventRange, formatThaiDateTime } from "@/lib/format";

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RequirePastor>
      <EventDetailContent id={id} />
    </RequirePastor>
  );
}

function checkinUrl(checkinCode: string): string {
  return `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/checkin?code=${checkinCode}`;
}

function attendeeName(user: EventCheckin["user"]): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (name && user.nickname) return `${name} (${user.nickname})`;
  return name || user.nickname || "ยังไม่ได้ลงทะเบียน";
}

function EventDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { liff } = useLIFF();
  const eventQ = useApi(() => getEvent(id), [id]);
  const checkinsQ = useApi(() => listEventCheckins(id), [id]);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (eventQ.isLoading) return <PageSpinner />;
  if (eventQ.error || !eventQ.data) {
    return <Callout variant="error">{errorMessage(eventQ.error)}</Callout>;
  }

  const event = eventQ.data.event;
  const checkins = checkinsQ.data?.checkins ?? [];
  const url = event.checkinCode ? checkinUrl(event.checkinCode) : null;

  const handleShare = async () => {
    if (!url) return;
    setShareNote(null);
    const text = `ขอเชิญร่วมเช็คอินกิจกรรม "${event.title}"\n${url}`;
    try {
      if (liff?.isLoggedIn() && liff.isApiAvailable("shareTargetPicker")) {
        const res = await liff.shareTargetPicker([{ type: "text", text }]);
        if (res) setShareNote("แชร์เรียบร้อยแล้ว ✓");
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareNote("คัดลอกลิงก์แล้ว ✓");
    } catch {
      setShareNote("แชร์ไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("คัดลอกลิงก์แล้ว ✓");
    } catch {
      setShareNote("คัดลอกไม่สำเร็จ");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`ลบกิจกรรม "${event.title}"? ประวัติเช็คอินของกิจกรรมนี้จะถูกลบด้วย`)) {
      return;
    }
    setDeleting(true);
    setActionError(null);
    try {
      await deleteEvent(id);
      router.replace("/admin/events");
    } catch (err) {
      setActionError(errorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="text-center">
        <p className="text-brand font-sans text-sm font-medium">กิจกรรม</p>
        <h1 className="mt-1 text-3xl">{event.title}</h1>
        <div
          aria-hidden
          className="spectral-rule mx-auto mt-3 h-0.5 w-16 rounded-full opacity-80"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          🗓️ {formatEventRange(event.startsAt, event.endsAt)}
        </p>
        {event.location && (
          <p className="mt-1 text-sm text-muted-foreground">📍 {event.location}</p>
        )}
      </section>

      {event.description && <Card>{event.description}</Card>}

      {url && (
        <section className="space-y-3">
          <h2 className="text-center text-2xl">QR เช็คอิน</h2>
          {/* Spectral frame around an always-white tile so the code scans
              reliably in dark mode too */}
          <div
            className="mx-auto w-fit rounded-2xl p-[3px] shadow-lg shadow-primary/15"
            style={{ background: "var(--gradient-conic)" }}
          >
            <div className="rounded-[calc(1rem-1px)] bg-white p-5">
              <QRCodeSVG value={url} size={224} marginSize={1} />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            ให้ผู้ร่วมงานสแกนเพื่อเช็คอินและรับ 10 แต้ม
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleCopy}>
              คัดลอกลิงก์
            </Button>
            <Button onClick={handleShare}>แชร์ผ่าน LINE</Button>
          </div>
          {shareNote && (
            <p className="text-center text-sm text-muted-foreground">{shareNote}</p>
          )}
        </section>
      )}

      <section>
        <h2 className="text-2xl">
          ผู้เช็คอิน{" "}
          <span className="text-muted-foreground">({checkins.length})</span>
        </h2>
        <div className="mt-4 space-y-3">
          {checkinsQ.isLoading ? (
            <PageSpinner />
          ) : checkinsQ.error ? (
            <Callout variant="error">{errorMessage(checkinsQ.error)}</Callout>
          ) : checkins.length === 0 ? (
            <EmptyState icon="🙌" title="ยังไม่มีผู้เช็คอิน" />
          ) : (
            checkins.map((c) => (
              <Card key={c.id} className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate font-sans">{attendeeName(c.user)}</p>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {formatThaiDateTime(c.checkedInAt)}
                </p>
              </Card>
            ))
          )}
        </div>
      </section>

      {actionError && <Callout variant="error">{actionError}</Callout>}

      <section className="grid grid-cols-2 gap-3 border-t pt-6">
        <Link href={`/admin/events/${id}/edit`}>
          <Button variant="outline" className="w-full">
            แก้ไขกิจกรรม
          </Button>
        </Link>
        <Button variant="destructive" loading={deleting} onClick={handleDelete}>
          ลบกิจกรรม
        </Button>
      </section>
    </div>
  );
}
