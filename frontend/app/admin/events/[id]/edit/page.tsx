"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { RequirePastor } from "@/components/guard";
import { EventForm } from "@/components/event-form";
import { Callout } from "@/components/ui/callout";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import { getEvent, updateEvent, errorMessage } from "@/lib/client";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RequirePastor>
      <EditEventContent id={id} />
    </RequirePastor>
  );
}

function EditEventContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, isLoading } = useApi(() => getEvent(id), [id]);

  if (isLoading) return <PageSpinner />;
  if (error || !data) {
    return <Callout variant="error">{errorMessage(error)}</Callout>;
  }

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl">แก้ไขกิจกรรม</h1>
      </section>

      <EventForm
        initial={data.event}
        submitLabel="บันทึกการแก้ไข"
        onSubmit={async (input) => {
          await updateEvent(id, input);
          router.replace(`/admin/events/${id}`);
        }}
      />
    </div>
  );
}
