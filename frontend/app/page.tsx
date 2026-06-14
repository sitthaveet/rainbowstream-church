"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
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

// "Upcoming" cutoff: the start of today (local midnight), fixed at page load
// (render-time Date.now() is impure). Judging by day rather than the exact
// moment keeps today's events listed even after their start/end time passes.
const TODAY_START_MS = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

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
    .filter((e) => Date.parse(e.endsAt ?? e.startsAt) >= TODAY_START_MS)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 3);
  const recent = (checkins.data?.checkins ?? []).slice(0, 3);
  const displayName = user!.nickname || user!.firstName || "เพื่อน";
  const isPastor = user!.role === "pastor";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <motion.section variants={item} className="pt-2 text-center">
        <p className="text-brand font-sans text-sm font-medium">ยินดีต้อนรับ</p>
        <h1 className="mt-1 text-4xl leading-tight">
          สวัสดี{" "}
          <span className="text-spectrum animate-spectrum-flow">
            {displayName}
          </span>{" "}
          👋
        </h1>
        <p className="mt-3 text-muted-foreground">
          ดีใจที่ได้เจอคุณอีกครั้งในวันนี้ 💗
        </p>
      </motion.section>

      {!registered && (
        <motion.div variants={item}>
          <Callout variant="accent" leading={<span>📝</span>}>
            <p className="font-sans font-medium">
              ลงทะเบียนสมาชิกให้เสร็จก่อนเช็คอินกิจกรรม
            </p>
            <Link
              href="/register"
              className="mt-1 inline-block text-link underline decoration-link-underline decoration-2 underline-offset-4 hover:text-link-hover"
            >
              ไปกรอกข้อมูล →
            </Link>
          </Callout>
        </motion.div>
      )}

      {/* ── Prism points medallion (the signature) ─────────────────── */}
      <motion.section variants={item} className="flex flex-col items-center">
        <PrismMedallion points={user!.points} />
      </motion.section>

      {/* ── Upcoming events ────────────────────────────────────────── */}
      <motion.section variants={item}>
        <SectionTitle>กิจกรรมที่กำลังจะมาถึง</SectionTitle>
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
      </motion.section>

      {/* ── Recent check-ins ───────────────────────────────────────── */}
      <motion.section variants={item}>
        <div className="flex items-baseline justify-between gap-3">
          <SectionTitle>เช็คอินล่าสุด</SectionTitle>
          <Link
            href="/history"
            className="shrink-0 font-sans text-sm text-link underline decoration-link-underline decoration-2 underline-offset-4 hover:text-link-hover"
          >
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
              <Card
                key={c.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans font-medium">
                    {c.event.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatThaiDateTime(c.checkedInAt)}
                  </p>
                </div>
                <PointsPill />
              </Card>
            ))
          )}
        </div>
      </motion.section>

      {/* ── Pastor tools ───────────────────────────────────────────── */}
      {isPastor && (
        <motion.section variants={item}>
          <SectionTitle>สำหรับศิษยาภิบาล</SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ActionCard href="/admin/events" icon="🗓️" label="จัดการกิจกรรม" />
            <ActionCard href="/admin/members" icon="💗" label="จัดการสมาชิก" />
          </div>
        </motion.section>
      )}

      {/* ── Profile link ───────────────────────────────────────────── */}
      <motion.section variants={item}>
        <Link href="/profile" className="block">
          <Card className="flex items-center justify-between hover:-translate-y-0.5 hover:border-decoration/40">
            <span className="font-sans font-medium">ข้อมูลของฉัน</span>
            <span aria-hidden className="text-decoration">→</span>
          </Card>
        </Link>
      </motion.section>
    </motion.div>
  );
}

/** The brand's signature object: a slowly-rotating spectral ring + glow with
 *  the member's points shimmering at its centre. */
function PrismMedallion({ points }: { points: number }) {
  return (
    <div className="relative grid aspect-square w-52 place-items-center">
      {/* rotating glow */}
      <div
        aria-hidden
        className="animate-spin-slow absolute inset-2 rounded-full opacity-70 blur-2xl"
        style={{ background: "var(--gradient-conic)" }}
      />
      {/* spectral ring */}
      <div
        className="relative grid size-44 place-items-center rounded-full p-[3px] shadow-xl shadow-primary/20"
        style={{ background: "var(--gradient-conic)" }}
      >
        <div className="grid size-full place-items-center rounded-full bg-card/90 text-center backdrop-blur-md">
          <div>
            <p className="text-spectrum animate-spectrum-flow font-display text-6xl leading-none">
              {points}
            </p>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              แต้มสะสม
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PointsPill() {
  return (
    <span className="shrink-0 rounded-full bg-success/70 px-2.5 py-1 font-sans text-sm font-semibold text-success-foreground ring-1 ring-inset ring-success-accent/20">
      +10
    </span>
  );
}

function ActionCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="flex flex-col items-center gap-3 py-6 text-center hover:-translate-y-0.5 hover:border-decoration/40">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent/70 text-2xl ring-1 ring-inset ring-decoration/15">
          {icon}
        </span>
        <span className="font-sans font-medium">{label}</span>
      </Card>
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-2xl">
      <span aria-hidden className="spectral-rule h-5 w-1 rounded-full" />
      {children}
    </h2>
  );
}
