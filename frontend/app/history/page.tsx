"use client";

import { useAuth } from "@/providers/auth-provider";
import { AuthBoundary } from "@/components/guard";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader eyebrow="เส้นทางของฉัน" title="ประวัติเช็คอิน">
        เช็คอินทั้งหมด {checkins.length} ครั้ง · แต้มสะสม{" "}
        <span className="font-sans font-semibold text-headings">
          {user!.points}
        </span>{" "}
        แต้ม
      </PageHeader>

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
                <p className="truncate font-sans font-medium">{c.event.title}</p>
                {c.event.location && (
                  <p className="truncate text-sm text-muted-foreground">
                    📍 {c.event.location}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatThaiDateTime(c.checkedInAt)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-success/70 px-2.5 py-1 font-sans text-sm font-semibold text-success-foreground ring-1 ring-inset ring-success-accent/20">
                +10
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
