"use client";

import Link from "next/link";
import { RequirePastor } from "@/components/guard";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { EventCard } from "@/components/event-card";
import { useApi } from "@/lib/use-api";
import { listEvents, errorMessage } from "@/lib/client";

export default function AdminEventsPage() {
  return (
    <RequirePastor>
      <AdminEventsContent />
    </RequirePastor>
  );
}

function AdminEventsContent() {
  const { data, error, isLoading } = useApi(listEvents, []);
  const events = data?.events ?? [];

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl">จัดการกิจกรรม</h1>
      </section>

      <Link href="/admin/events/new" className="block">
        <Button className="w-full" size="lg">
          + สร้างกิจกรรมใหม่
        </Button>
      </Link>

      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <Callout variant="error">{errorMessage(error)}</Callout>
      ) : events.length === 0 ? (
        <EmptyState icon="🗓️" title="ยังไม่มีกิจกรรม">
          สร้างกิจกรรมแรกของคุณได้เลย
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
  );
}
