"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RequirePastor } from "@/components/guard";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageSpinner } from "@/components/ui/spinner";
import { EventCard } from "@/components/event-card";
import { TabList } from "@/components/ui/tabs";
import { useApi } from "@/lib/use-api";
import { listEvents, errorMessage } from "@/lib/client";
import { isUpcomingEvent } from "@/lib/format";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "upcoming", label: "กำลังจะมาถึง" },
  { key: "past", label: "ผ่านมาแล้ว" },
] as const;
type EventTab = (typeof TABS)[number]["key"];

const EMPTY_TEXT: Record<EventTab, string> = {
  upcoming: "ยังไม่มีกิจกรรมที่กำลังจะมาถึง",
  past: "ยังไม่มีกิจกรรมที่ผ่านมา",
};

export default function AdminEventsPage() {
  return (
    <RequirePastor>
      <AdminEventsContent />
    </RequirePastor>
  );
}

function AdminEventsContent() {
  const { data, error, isLoading } = useApi(listEvents, []);
  const [tab, setTab] = useState<EventTab>("upcoming");
  const [now] = useState(() => Date.now());

  // The API returns events newest-first (starts_at desc): upcoming reads
  // soonest-first, past keeps most-recent-first.
  const { upcoming, past } = useMemo(() => {
    const all = data?.events ?? [];
    return {
      upcoming: all.filter((e) => isUpcomingEvent(e, now)).reverse(),
      past: all.filter((e) => !isUpcomingEvent(e, now)),
    };
  }, [data, now]);

  const events = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ศิษยาภิบาล" title="จัดการกิจกรรม" />

      <Link href="/admin/events/new" className="block">
        <Button className="w-full" size="lg">
          + สร้างกิจกรรมใหม่
        </Button>
      </Link>

      <TabList
        tabs={TABS}
        value={tab}
        onChange={setTab}
        idBase="admin-events"
        aria-label="กรองกิจกรรมตามช่วงเวลา"
        className="rounded-xl bg-shade"
        tabClassName={(active) =>
          cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
            active
              ? "border border-border/70 bg-card text-headings shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )
        }
      />

      <div
        role="tabpanel"
        id={`admin-events-tabpanel-${tab}`}
        aria-labelledby={`admin-events-tab-${tab}`}
      >
        {isLoading ? (
          <PageSpinner />
        ) : error ? (
          <Callout variant="error">{errorMessage(error)}</Callout>
        ) : events.length === 0 ? (
          <EmptyState icon="🗓️" title={EMPTY_TEXT[tab]}>
            {tab === "upcoming" && "สร้างกิจกรรมใหม่ได้เลย"}
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                href={`/admin/events/${event.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
