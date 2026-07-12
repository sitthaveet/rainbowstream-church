"use client";

import Link from "next/link";
import { RequirePastor } from "@/components/guard";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import { listMembers, errorMessage } from "@/lib/client";
import { displayName } from "@/lib/format";

export default function AdminMembersPage() {
  return (
    <RequirePastor>
      <MembersContent />
    </RequirePastor>
  );
}

function MembersContent() {
  const { data, error, isLoading } = useApi(listMembers, []);
  const members = data?.users ?? [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ศิษยาภิบาล" title="จัดการสมาชิก">
        สมาชิกทั้งหมด {members.length} คน
      </PageHeader>

      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <Callout variant="error">{errorMessage(error)}</Callout>
      ) : members.length === 0 ? (
        <EmptyState icon="💗" title="ยังไม่มีสมาชิก" />
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Link key={m.id} href={`/admin/members/${m.id}`} className="block">
              <Card className="flex items-center justify-between gap-3 hover:-translate-y-0.5 hover:border-decoration/40">
                <div className="min-w-0">
                  <p className="truncate font-sans font-medium">
                    {displayName(m)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.points} แต้ม
                  </p>
                </div>
                {m.role === "pastor" && (
                  <span className="shrink-0 rounded-full bg-accent px-3 py-1 font-sans text-xs font-medium text-accent-foreground ring-1 ring-inset ring-decoration/15">
                    ศิษยาภิบาล
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
