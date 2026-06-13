"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { AuthBoundary } from "@/components/guard";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

export default function ProfilePage() {
  return (
    <AuthBoundary>
      <ProfileContent />
    </AuthBoundary>
  );
}

function ProfileContent() {
  const { user, registered, refreshUser, logout } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl">ข้อมูลของฉัน</h1>
        <p className="mt-2 text-muted-foreground">
          แต้มสะสม{" "}
          <span className="font-sans text-headings">{user!.points}</span> แต้ม
          {user!.role === "pastor" && " · ศิษยาภิบาล"}
        </p>
      </section>

      {!registered && (
        <Callout variant="accent">
          กรอกข้อมูลด้านล่างให้ครบเพื่อลงทะเบียนสมาชิก
        </Callout>
      )}

      {saved && (
        <Callout variant="success" className="text-center">
          บันทึกข้อมูลเรียบร้อยแล้ว ✓
        </Callout>
      )}

      <ProfileForm
        user={user!}
        submitLabel="บันทึกข้อมูล"
        onSaved={async () => {
          await refreshUser();
          setSaved(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <div className="border-t pt-6">
        <Button
          variant="outline"
          className="w-full text-error-foreground"
          loading={loggingOut}
          onClick={() => {
            setLoggingOut(true);
            void logout();
          }}
        >
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
