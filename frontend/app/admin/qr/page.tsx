"use client";

import { useState } from "react";
import { RequirePastor } from "@/components/guard";
import { CheckinQr, checkinUrl } from "@/components/checkin-qr";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { PageHeader } from "@/components/ui/page-header";
import { PageSpinner } from "@/components/ui/spinner";
import { useApi } from "@/lib/use-api";
import { getChurchQr, errorMessage } from "@/lib/client";

export default function ChurchQrPage() {
  return (
    <RequirePastor>
      <ChurchQrContent />
    </RequirePastor>
  );
}

/** The church-wide static check-in QR — print it once and reuse it at every
 *  gathering. The first scan of each day creates that day's gathering. */
function ChurchQrContent() {
  const { data, error, isLoading } = useApi(getChurchQr, []);
  const [note, setNote] = useState<string | null>(null);

  if (isLoading) return <PageSpinner />;
  if (error || !data) {
    return <Callout variant="error">{errorMessage(error)}</Callout>;
  }

  const url = checkinUrl(data.checkinCode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setNote("คัดลอกลิงก์แล้ว ✓");
    } catch {
      setNote("คัดลอกไม่สำเร็จ");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ศิษยาภิบาล" title="QR เช็คอินประจำคริสตจักร">
        พิมพ์ครั้งเดียว ใช้ได้ทุกครั้งที่มีการรวมตัว
      </PageHeader>

      <CheckinQr url={url} size={280} />

      <Callout variant="muted">
        ผู้ที่สแกนคนแรกของวันจะสร้างกิจกรรม “Gathering วว-ดด-ปปปป” (ปี ค.ศ.) ให้อัตโนมัติ
        ทุกคนที่สแกนในวันเดียวกันจะเช็คอินเข้ากิจกรรมเดียวกันจนถึงเที่ยงคืน
        — แก้ไขชื่อกิจกรรมได้ภายหลังที่หน้าจัดการกิจกรรม
      </Callout>

      <div className="grid grid-cols-2 gap-3 print:hidden">
        <Button variant="secondary" onClick={handleCopy}>
          คัดลอกลิงก์
        </Button>
        <Button onClick={() => window.print()}>พิมพ์ QR</Button>
      </div>
      {note && (
        <p className="text-center text-sm text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
