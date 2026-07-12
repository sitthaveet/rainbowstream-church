"use client";

import { AuthBoundary } from "@/components/guard";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import { getLeaderboard, errorMessage } from "@/lib/client";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Gold / silver / bronze treatments for the top-3 rows — the one place raw
 *  palette colors are allowed, since medal metals have no semantic token. */
const PODIUM = [
  {
    card: "border-amber-400/40 bg-amber-400/10",
    badge: "bg-amber-400/25 text-amber-700 ring-amber-500/40 dark:text-amber-300",
  },
  {
    card: "border-slate-400/40 bg-slate-400/10",
    badge: "bg-slate-400/25 text-slate-600 ring-slate-400/40 dark:text-slate-300",
  },
  {
    card: "border-orange-700/30 bg-orange-700/10",
    badge: "bg-orange-700/20 text-orange-800 ring-orange-700/40 dark:text-orange-300",
  },
] as const;

export default function LeaderboardPage() {
  return (
    <AuthBoundary>
      <LeaderboardContent />
    </AuthBoundary>
  );
}

function LeaderboardContent() {
  const { data, error, isLoading } = useApi(getLeaderboard, []);
  const entries = data?.leaderboard ?? [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ผู้สะสมแต้มสูงสุด" title="อันดับแต้มสะสม">
        10 อันดับสมาชิกที่มีแต้มสะสมสูงสุดจากการเช็คอิน
      </PageHeader>

      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <Callout variant="error">{errorMessage(error)}</Callout>
      ) : entries.length === 0 ? (
        <EmptyState icon="🏆" title="ยังไม่มีใครขึ้นกระดาน">
          เช็คอินที่งานเพื่อสะสมแต้มและเป็นคนแรกบนกระดานนี้
        </EmptyState>
      ) : (
        <ol className="space-y-3">
          {entries.map((entry, i) => {
            const rank = i + 1;
            const podium = PODIUM[i];
            return (
              <li key={rank}>
                <Card className={cn("flex items-center gap-3", podium?.card)}>
                  <span
                    className={cn(
                      "relative grid size-10 shrink-0 place-items-center rounded-full font-sans text-sm font-semibold ring-1 ring-inset",
                      podium
                        ? podium.badge
                        : "bg-shade text-muted-foreground ring-border/60",
                    )}
                  >
                    {podium && (
                      <span
                        aria-hidden
                        className="absolute -top-3.5 text-base drop-shadow-sm"
                      >
                        👑
                      </span>
                    )}
                    {rank}
                  </span>
                  <p className="min-w-0 flex-1 truncate font-sans font-medium">
                    {displayName(entry, "ไม่ระบุชื่อ")}
                  </p>
                  <span className="shrink-0 font-sans text-sm text-muted-foreground">
                    <span className="text-base font-semibold text-headings">
                      {entry.points.toLocaleString()}
                    </span>{" "}
                    แต้ม
                  </span>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
