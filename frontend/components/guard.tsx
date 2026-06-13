"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { PageSpinner } from "@/components/ui/spinner";
import { Callout } from "@/components/ui/callout";

/** Renders children once the LIFF→session bootstrap has produced a user. */
export function AuthBoundary({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useAuth();

  if (isLoading) return <PageSpinner label="กำลังเข้าสู่ระบบ…" />;
  if (error) return <Callout variant="error">{error}</Callout>;
  // No user + no error = liff.login() redirect is in flight.
  if (!user) return <PageSpinner label="กำลังพาไปเข้าสู่ระบบ LINE…" />;
  return <>{children}</>;
}

/** Sends users with an incomplete profile to /register (with a return URL). */
export function RequireRegistered({ children }: { children: React.ReactNode }) {
  return (
    <AuthBoundary>
      <RegisteredGate>{children}</RegisteredGate>
    </AuthBoundary>
  );
}

function RegisteredGate({ children }: { children: React.ReactNode }) {
  const { registered } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!registered) {
      const next = window.location.pathname + window.location.search;
      router.replace(`/register?next=${encodeURIComponent(next)}`);
    }
  }, [registered, router]);

  if (!registered) return <PageSpinner label="กำลังไปหน้าลงทะเบียน…" />;
  return <>{children}</>;
}

/** Pastor-only area; members get a friendly 403 instead of a redirect. */
export function RequirePastor({ children }: { children: React.ReactNode }) {
  return (
    <AuthBoundary>
      <PastorGate>{children}</PastorGate>
    </AuthBoundary>
  );
}

function PastorGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user!.role !== "pastor") {
    return (
      <Callout variant="accent">
        ส่วนนี้สำหรับศิษยาภิบาลเท่านั้น
      </Callout>
    );
  }
  return <>{children}</>;
}
