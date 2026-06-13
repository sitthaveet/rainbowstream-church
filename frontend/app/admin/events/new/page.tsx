"use client";

import { useRouter } from "next/navigation";
import { RequirePastor } from "@/components/guard";
import { EventForm } from "@/components/event-form";
import { createEvent } from "@/lib/client";

export default function NewEventPage() {
  return (
    <RequirePastor>
      <NewEventContent />
    </RequirePastor>
  );
}

function NewEventContent() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl">สร้างกิจกรรมใหม่</h1>
      </section>

      <EventForm
        submitLabel="สร้างกิจกรรม"
        onSubmit={async (input) => {
          const { event } = await createEvent(input);
          router.replace(`/admin/events/${event.id}`);
        }}
      />
    </div>
  );
}
