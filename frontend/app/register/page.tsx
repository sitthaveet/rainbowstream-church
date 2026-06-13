"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { AuthBoundary } from "@/components/guard";
import { ProfileForm } from "@/components/profile-form";
import { Callout } from "@/components/ui/callout";
import { PageSpinner } from "@/components/ui/spinner";

/** Allows only same-app relative redirect targets. */
function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export default function RegisterPage() {
  return (
    <AuthBoundary>
      <Suspense fallback={<PageSpinner />}>
        <RegisterContent />
      </Suspense>
    </AuthBoundary>
  );
}

function RegisterContent() {
  const { user, registered, refreshUser } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  // Already registered (e.g. arrived via an old link) — nothing to do here.
  useEffect(() => {
    if (registered) router.replace(next);
  }, [registered, router, next]);

  if (registered) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl">ลงทะเบียนสมาชิก</h1>
        <p className="mt-2 text-muted-foreground">
          กรอกข้อมูลสั้น ๆ เพื่อให้เรารู้จักคุณมากขึ้น
        </p>
      </section>

      <Callout variant="accent" leading={<span>🔒</span>}>
        ข้อมูลของคุณจะถูกเก็บเป็นความลับ และเห็นได้เฉพาะศิษยาภิบาลเท่านั้น
      </Callout>

      <ProfileForm
        user={user!}
        submitLabel="ลงทะเบียน"
        onSaved={async () => {
          await refreshUser();
          router.replace(next);
        }}
      />
    </div>
  );
}
