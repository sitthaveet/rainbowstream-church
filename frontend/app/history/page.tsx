"use client";

import { useAuth } from "@/providers/auth-provider";
import { AuthBoundary } from "@/components/guard";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import { listUserCheckins, errorMessage } from "@/lib/client";
import { formatThaiDateTime } from "@/lib/format";

export default function HistoryPage() {
  return (
    <AuthBoundary>
      <HistoryContent />
    </AuthBoundary>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const { data, error, isLoading } = useApi(
    () => listUserCheckins(user!.id),
    [user?.id],
    !!user,
  );
  const checkins = data?.checkins ?? [];

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl">ประวัติเช็คอิน</h1>
        <p className="mt-2 text-muted-foreground">
          เช็คอินทั้งหมด {checkins.length} ครั้ง · แต้มสะสม{" "}
          <span className="font-sans text-headings">{user!.points}</span> แต้ม
        </p>
      </section>

      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <Callout variant="error">{errorMessage(error)}</Callout>
      ) : checkins.length === 0 ? (
        <EmptyState icon="✨" title="ยังไม่มีประวัติเช็คอิน">
          สแกน QR ที่งานเพื่อเช็คอินครั้งแรกของคุณ
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {checkins.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-sans">{c.event.title}</p>
                {c.event.location && (
                  <p className="truncate text-sm text-muted-foreground">
                    📍 {c.event.location}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatThaiDateTime(c.checkedInAt)}
                </p>
              </div>
              <span className="shrink-0 font-sans text-success-accent">+10</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
