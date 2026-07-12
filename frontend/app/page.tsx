"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useAuth } from "@/providers/auth-provider";
import { AuthBoundary } from "@/components/guard";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { EventCard } from "@/components/event-card";
import { TabList } from "@/components/ui/tabs";
import { useApi, type UseApiResult } from "@/lib/use-api";
import { listEvents, type EventSummary } from "@/lib/client";
import { isUpcomingEvent } from "@/lib/format";
import { cn } from "@/lib/cn";

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
const panel: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

const TABS = [
  { key: "home", icon: "🏠", label: "หน้าหลัก" },
  { key: "admin", icon: "🛠️", label: "ศิษยาภิบาล" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/** The events fetch result, hoisted above the pastor tabs — useApi has no
 *  cache, so it must live in a component that stays mounted across switches. */
type EventsApi = UseApiResult<{ events: EventSummary[] }>;

export default function HomePage() {
  return (
    <AuthBoundary>
      <HomeContent />
    </AuthBoundary>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const events = useApi(listEvents, [], !!user);

  if (user!.role !== "pastor") return <MemberHome events={events} />;
  return <PastorHome events={events} />;
}

/** Pastor view: the member home and the admin tools, as two switchable tabs. */
function PastorHome({ events }: { events: EventsApi }) {
  const [tab, setTab] = useState<TabKey>("home");

  return (
    <div className="space-y-8">
      <motion.div variants={item} initial="hidden" animate="show">
        <HomeTabs value={tab} onChange={setTab} />
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          id={`home-tabpanel-${tab}`}
          aria-labelledby={`home-tab-${tab}`}
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {tab === "home" ? <MemberHome events={events} /> : <PastorTools />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Segmented two-tab control; the active pill slides between tabs. */
function HomeTabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <TabList
      tabs={TABS.map((t) => ({
        key: t.key,
        label: (
          <>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </>
        ),
      }))}
      value={value}
      onChange={onChange}
      idBase="home"
      aria-label="สลับมุมมองหน้าหลัก"
      className="rounded-2xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm"
      tabClassName={(active) =>
        cn(
          "relative rounded-xl px-3 py-2.5 font-sans text-sm font-medium transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
          active
            ? "text-accent-foreground"
            : "text-muted-foreground hover:text-foreground",
        )
      }
      activeBackdrop={
        <motion.span
          aria-hidden
          layoutId="home-tab-pill"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="absolute inset-0 rounded-xl bg-accent/70 ring-1 ring-decoration/15 ring-inset"
        />
      }
    />
  );
}

/** The home every member sees: hero, points medallion, upcoming events. */
function MemberHome({ events }: { events: EventsApi }) {
  const { user, registered } = useAuth();
  const isPastor = user!.role === "pastor";

  const upcoming = (events.data?.events ?? [])
    .filter((e) => isUpcomingEvent(e, TODAY_START_MS))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 3);
  const displayName = user!.nickname || user!.firstName || "เพื่อน";

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
    </motion.div>
  );
}

/** The admin tab: pastor tools. */
function PastorTools() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={item}>
        <SectionTitle>สำหรับศิษยาภิบาล</SectionTitle>
      </motion.div>
      <motion.div variants={item}>
        <ToolCard
          href="/admin/events"
          icon="🗓️"
          label="จัดการกิจกรรม"
          description="สร้างกิจกรรม แชร์ QR เช็คอิน และดูรายชื่อผู้เข้าร่วม"
        />
      </motion.div>
      <motion.div variants={item}>
        <ToolCard
          href="/admin/members"
          icon="💗"
          label="จัดการสมาชิก"
          description="ดูข้อมูลสมาชิกและประวัติเช็คอิน"
        />
      </motion.div>
    </motion.section>
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

function ToolCard({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center gap-4 hover:-translate-y-0.5 hover:border-decoration/40">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/70 text-2xl ring-1 ring-decoration/15 ring-inset">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-sans font-medium">{label}</span>
          <span className="mt-0.5 block font-sans text-sm text-muted-foreground">
            {description}
          </span>
        </span>
        <span aria-hidden className="text-decoration">
          →
        </span>
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
