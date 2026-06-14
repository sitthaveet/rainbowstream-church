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
import { PageSpinner, SpectralRing } from "@/components/ui/spinner";
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
        {phase === "success" ? (
          <span className="text-spectrum animate-spectrum-flow">
            เช็คอินสำเร็จ!
          </span>
        ) : (
          "เช็คอินกิจกรรม"
        )}
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
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
          <SpectralRing className="size-9" />
          <p className="font-sans text-sm">กำลังเช็คอิน…</p>
        </div>
      )}

      {phase === "success" && <CheckinCelebration points={points} />}

      {phase === "already" && (
        <Callout variant="accent" className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-lg">
            ✓
          </span>
          <span>คุณได้เช็คอินกิจกรรมนี้ไปแล้ว — ขอบคุณที่มาร่วมงานนะ 💗</span>
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

/** The celebration: a burst of spectral light rays behind a glowing prism ring
 *  with a drawn-on checkmark, then the points awarded shimmering below. */
function CheckinCelebration({ points }: { points: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 py-2"
    >
      <div className="relative grid size-40 place-items-center">
        {/* soft pulsing glow */}
        <div
          aria-hidden
          className="animate-glow absolute inset-6 rounded-full blur-2xl"
          style={{ background: "var(--gradient-conic)" }}
        />
        <RayBurst />
        {/* prism ring + check */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 13, delay: 0.1 }}
          className="relative grid size-28 place-items-center rounded-full p-[3px] shadow-xl shadow-primary/30"
          style={{ background: "var(--gradient-conic)" }}
        >
          <div className="grid size-full place-items-center rounded-full bg-card/95 backdrop-blur">
            <DrawnCheck />
          </div>
        </motion.div>
      </div>

      <div className="text-center">
        <p className="text-spectrum animate-spectrum-flow font-display text-4xl leading-none">
          +{points} แต้ม
        </p>
        <p className="mt-3 text-muted-foreground">
          ขอบคุณที่มาร่วมกิจกรรมกับเรา 💗
        </p>
      </div>
    </motion.div>
  );
}

const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

function RayBurst() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 size-0"
    >
      {RAYS.map((deg) => (
        <motion.span
          key={deg}
          className="absolute bottom-0 h-14 w-[3px] rounded-full"
          style={{
            left: "-1.5px",
            transformOrigin: "bottom center",
            background: "var(--gradient-spectrum)",
          }}
          initial={{ scaleY: 0, opacity: 0, rotate: deg }}
          animate={{ scaleY: 1, opacity: 0.6, rotate: deg }}
          transition={{
            delay: 0.2 + (deg / 30) * 0.025,
            duration: 0.55,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function DrawnCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-12">
      <defs>
        <linearGradient id="check-spectrum" x1="2" y1="4" x2="22" y2="20">
          <stop offset="0" style={{ stopColor: "var(--spectrum-1)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--spectrum-3)" }} />
          <stop offset="1" style={{ stopColor: "var(--spectrum-6)" }} />
        </linearGradient>
      </defs>
      <motion.path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="url(#check-spectrum)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}
