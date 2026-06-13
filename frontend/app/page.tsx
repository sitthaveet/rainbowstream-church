"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { AuthBoundary } from "@/components/guard";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { EventCard } from "@/components/event-card";
import { useApi } from "@/lib/use-api";
import { listEvents, listUserCheckins } from "@/lib/client";
import { formatThaiDateTime } from "@/lib/format";

// "Upcoming" cutoff, fixed at page load (render-time Date.now() is impure).
const PAGE_LOAD_MS = Date.now();

export default function HomePage() {
  return (
    <AuthBoundary>
      <HomeContent />
    </AuthBoundary>
  );
}

function HomeContent() {
  const { user, registered } = useAuth();
  const events = useApi(listEvents, [], !!user);
  const checkins = useApi(() => listUserCheckins(user!.id), [user?.id], !!user);

  const upcoming = (events.data?.events ?? [])
    .filter((e) => Date.parse(e.endsAt ?? e.startsAt) >= PAGE_LOAD_MS)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 3);
  const recent = (checkins.data?.checkins ?? []).slice(0, 3);
  const displayName = user!.nickname || user!.firstName || "เพื่อน";
  const isPastor = user!.role === "pastor";

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl">สวัสดี {displayName} 👋</h1>
        <p className="mt-2 text-muted-foreground">
          ยินดีต้อนรับสู่ครอบครัว Rainbow Stream
        </p>
      </section>

      {!registered && (
        <Callout variant="accent" leading={<span>📝</span>}>
          <p className="font-sans">ลงทะเบียนสมาชิกให้เสร็จก่อนเช็คอินกิจกรรม</p>
          <Link href="/register" className="mt-1 inline-block text-link underline decoration-link-underline decoration-2 underline-offset-4 hover:text-link-hover">
            ไปกรอกข้อมูล →
          </Link>
        </Callout>
      )}

      <section>
        <Callout variant="accent" className="text-center">
          <p className="font-sans text-sm">แต้มสะสมของฉัน</p>
          <p className="font-sans text-5xl text-headings">{user!.points}</p>
          <p className="mt-1 text-sm">เช็คอินกิจกรรมรับครั้งละ 10 แต้ม</p>
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl">กิจกรรมที่กำลังจะมาถึง</h2>
        <div className="mt-4 space-y-3">
          {events.isLoading ? (
            <PageSpinner />
          ) : upcoming.length === 0 ? (
            <EmptyState icon="🗓️" title="ยังไม่มีกิจกรรมเร็ว ๆ นี้">
              ติดตามประกาศกิจกรรมใหม่ได้ที่นี่
            </EmptyState>
          ) : (
            upcoming.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                href={isPastor ? `/admin/events/${event.id}` : undefined}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">เช็คอินล่าสุด</h2>
          <Link href="/history" className="text-sm text-link underline decoration-link-underline decoration-2 underline-offset-4 hover:text-link-hover">
            ดูทั้งหมด
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {checkins.isLoading ? (
            <PageSpinner />
          ) : recent.length === 0 ? (
            <EmptyState icon="✨" title="ยังไม่มีประวัติเช็คอิน">
              สแกน QR ที่งานเพื่อเช็คอินครั้งแรกของคุณ
            </EmptyState>
          ) : (
            recent.map((c) => (
              <Card key={c.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-sans">{c.event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatThaiDateTime(c.checkedInAt)}
                  </p>
                </div>
                <span className="shrink-0 font-sans text-success-accent">+10</span>
              </Card>
            ))
          )}
        </div>
      </section>

      {isPastor && (
        <section>
          <h2 className="text-2xl">สำหรับศิษยาภิบาล</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/admin/events">
              <Card className="text-center transition-colors duration-150 hover:bg-shade">
                <p className="text-3xl">🗓️</p>
                <p className="mt-2 font-sans">จัดการกิจกรรม</p>
              </Card>
            </Link>
            <Link href="/admin/members">
              <Card className="text-center transition-colors duration-150 hover:bg-shade">
                <p className="text-3xl">💗</p>
                <p className="mt-2 font-sans">จัดการสมาชิก</p>
              </Card>
            </Link>
          </div>
        </section>
      )}

      <section>
        <Link href="/profile">
          <Card className="flex items-center justify-between transition-colors duration-150 hover:bg-shade">
            <p className="font-sans">ข้อมูลของฉัน</p>
            <span className="text-muted-foreground">→</span>
          </Card>
        </Link>
      </section>
    </div>
  );
}
