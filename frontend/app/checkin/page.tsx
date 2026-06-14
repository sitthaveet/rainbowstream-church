"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/providers/auth-provider";
import { AuthBoundary } from "@/components/guard";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import { formatEventRange } from "@/lib/format";
import {
  checkIn,
  getEventByCode,
  errorMessage,
  ClientApiError,
  type EventByCode,
} from "@/lib/client";

export default function CheckinPage() {
  return (
    <AuthBoundary>
      <Suspense fallback={<PageSpinner />}>
        <CheckinContent />
      </Suspense>
    </AuthBoundary>
  );
}

type Phase =
  | "loading"
  | "invalid"
  | "ready"
  | "checking"
  | "success"
  | "already"
  | "error";

function CheckinContent() {
  const { user, registered, refreshUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");

  const [phase, setPhase] = useState<Phase>(code ? "loading" : "invalid");
  const [event, setEvent] = useState<EventByCode | null>(null);
  const [points, setPoints] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const autoFiredRef = useRef(false);

  // Resolve the scanned code to its event. Depends on the stable user id,
  // not the user object — refreshUser() after a successful check-in returns a
  // fresh object, and re-running this effect would reset the phase from
  // "success" back to "ready", wiping the celebration screen.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!code || !userId) return;
    let cancelled = false;
    getEventByCode(code)
      .then(({ event }) => {
        if (cancelled) return;
        setEvent(event);
        setPhase("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ClientApiError && err.status === 404) {
          setPhase("invalid");
        } else {
          setError(errorMessage(err));
          setPhase("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code, userId]);

  // Register-first gate: finish the profile, then come back — the check-in
  // fires automatically once the event resolves on return.
  useEffect(() => {
    if (user && !registered && code) {
      const next = `/checkin?code=${encodeURIComponent(code)}`;
      router.replace(`/register?next=${encodeURIComponent(next)}`);
    }
  }, [user, registered, code, router]);

  const doCheckin = useCallback(async () => {
    if (!code) return;
    setPhase("checking");
    try {
      const res = await checkIn(code);
      setPoints(res.pointsAwarded);
      setPhase("success");
      await refreshUser(); // pick up the new points balance
    } catch (err) {
      if (err instanceof ClientApiError && err.code === "already_checked_in") {
        setPhase("already");
      } else {
        setError(errorMessage(err));
        setPhase("error");
      }
    }
  }, [code, refreshUser]);

  // Check in automatically as soon as the event resolves — no manual confirm.
  // The guard ref ensures this fires exactly once, even though refreshUser()
  // after success can re-render this component.
  useEffect(() => {
    if (phase === "ready" && registered && !autoFiredRef.current) {
      autoFiredRef.current = true;
      void doCheckin();
    }
  }, [phase, registered, doCheckin]);

  if (!registered) return <PageSpinner label="กำลังไปหน้าลงทะเบียน…" />;

  if (phase === "loading") return <PageSpinner label="กำลังตรวจสอบกิจกรรม…" />;

  if (phase === "invalid") {
    return (
      <div className="space-y-4">
        <h1 className="text-center text-3xl">เช็คอินไม่สำเร็จ</h1>
        <Callout variant="error">
          ไม่พบกิจกรรมจากรหัสนี้ — QR code อาจไม่ถูกต้องหรือกิจกรรมถูกยกเลิกแล้ว
        </Callout>
        <BackHomeButton />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="space-y-4">
        <h1 className="text-center text-3xl">เกิดข้อผิดพลาด</h1>
        <Callout variant="error">{error}</Callout>
        <BackHomeButton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl">
        {phase === "success" ? "เช็คอินสำเร็จ! 🎉" : "เช็คอินกิจกรรม"}
      </h1>

      {event && (
        <Card>
          <h2 className="text-xl">{event.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            🗓️ {formatEventRange(event.startsAt, event.endsAt)}
          </p>
          {event.location && (
            <p className="mt-1 text-sm text-muted-foreground">
              📍 {event.location}
            </p>
          )}
          {event.description && <p className="mt-3 leading-7">{event.description}</p>}
        </Card>
      )}

      {(phase === "ready" || phase === "checking") && (
        <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
          <Spinner className="size-6 text-decoration" />
          <p className="text-sm">กำลังเช็คอิน…</p>
        </div>
      )}

      {phase === "success" && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        >
          <Callout variant="success" className="text-center">
            <p className="text-4xl">✓</p>
            <p className="mt-2 font-sans text-2xl">+{points} แต้ม</p>
            <p className="mt-1 text-sm">ขอบคุณที่มาร่วมกิจกรรมกับเรา 💗</p>
          </Callout>
        </motion.div>
      )}

      {phase === "already" && (
        <Callout variant="accent" className="text-center">
          คุณได้เช็คอินกิจกรรมนี้ไปแล้ว ✓
        </Callout>
      )}

      {(phase === "success" || phase === "already") && (
        <div className="grid grid-cols-2 gap-3">
          <Link href="/">
            <Button variant="outline" className="w-full">
              หน้าหลัก
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="secondary" className="w-full">
              ประวัติเช็คอิน
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function BackHomeButton() {
  return (
    <Link href="/" className="block">
      <Button variant="outline" className="w-full">
        กลับหน้าหลัก
      </Button>
    </Link>
  );
}
