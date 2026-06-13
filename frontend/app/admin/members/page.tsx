"use client";

import Link from "next/link";
import { RequirePastor } from "@/components/guard";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import { listMembers, errorMessage, type MemberSummary } from "@/lib/client";

function memberName(m: MemberSummary): string {
  const name = [m.firstName, m.lastName].filter(Boolean).join(" ");
  if (name && m.nickname) return `${name} (${m.nickname})`;
  return name || m.nickname || "ยังไม่ได้ลงทะเบียน";
}

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
      <section className="text-center">
        <h1 className="text-3xl">จัดการสมาชิก</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          สมาชิกทั้งหมด {members.length} คน
        </p>
      </section>

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
              <Card className="flex items-center justify-between gap-3 transition-colors duration-150 hover:bg-shade">
                <div className="min-w-0">
                  <p className="truncate font-sans">{memberName(m)}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.points} แต้ม
                  </p>
                </div>
                {m.role === "pastor" && (
                  <span className="shrink-0 rounded-full bg-accent px-3 py-1 font-sans text-xs text-accent-foreground">
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
