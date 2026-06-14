"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLIFF } from "./liff-providers";
import {
  apiLogin,
  apiLogout,
  apiMe,
  ClientApiError,
  type ApiUser,
} from "@/lib/client";

/** Survives the liff.logout()→liff.login() redirect so a server that keeps
 *  rejecting fresh ID tokens becomes an error screen, not a login loop. */
const RETRY_KEY = "rsc-login-retried";

interface AuthContextValue {
  user: ApiUser | null;
  /** Profile completed (server: users.registered_at is set). */
  registered: boolean;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { liff, isLoading: liffLoading, liffError } = useLIFF();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (liffLoading || startedRef.current) return;
    startedRef.current = true;

    const apply = (result: { user: ApiUser; registered: boolean }) => {
      sessionStorage.removeItem(RETRY_KEY);
      setUser(result.user);
      setRegistered(result.registered);
    };

    const bootstrap = async (): Promise<void> => {
      // 1) An existing session cookie wins — also lets the app work in a
      //    plain browser during development without LIFF.
      try {
        apply(await apiMe());
        return;
      } catch (err) {
        if (!(err instanceof ClientApiError && err.status === 401)) throw err;
      }

      // 2) No session — bridge LIFF login to our backend.
      if (!liff) {
        throw new Error(liffError ?? "ไม่สามารถเชื่อมต่อ LINE ได้");
      }
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
        return; // redirecting away
      }
      const idToken = liff.getIDToken();
      if (!idToken) {
        relogin();
        return;
      }
      try {
        apply(await apiLogin(idToken));
      } catch (err) {
        // 401 = expired/invalid ID token: one fresh LINE login round-trip.
        if (err instanceof ClientApiError && err.status === 401) {
          relogin();
          return;
        }
        throw err;
      }
    };

    const relogin = () => {
      if (sessionStorage.getItem(RETRY_KEY)) {
        sessionStorage.removeItem(RETRY_KEY);
        throw new Error("เข้าสู่ระบบไม่สำเร็จ กรุณาปิดหน้านี้แล้วเปิดใหม่อีกครั้ง");
      }
      sessionStorage.setItem(RETRY_KEY, "1");
      liff!.logout();
      liff!.login({ redirectUri: window.location.href });
    };

    bootstrap()
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setIsLoading(false));
  }, [liff, liffLoading, liffError]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await apiMe();
      setUser(me.user);
      setRegistered(me.registered);
    } catch (err) {
      if (err instanceof ClientApiError && err.status === 401) {
        setUser(null);
        setRegistered(false);
      } else {
        throw err;
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout().catch(() => {});
    if (liff?.isLoggedIn()) liff.logout();
    window.location.href = "/";
  }, [liff]);

  return (
    <AuthContext.Provider
      value={{ user, registered, isLoading, error, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
