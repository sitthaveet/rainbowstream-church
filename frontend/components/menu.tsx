"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/", icon: "🏠", label: "หน้าหลัก" },
  { href: "/profile", icon: "💗", label: "ข้อมูลของฉัน" },
  { href: "/history", icon: "✨", label: "ประวัติเช็คอิน" },
] as const;

/** Hamburger menu pinned to the top-left of the fixed header, opening a
 *  left slide-in drawer. Always visible (the app is mobile-first LIFF). */
export function Menu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  // Close whenever navigation lands on a new page (covers back/forward too —
  // link taps already close via onClick). State-adjust-during-render pattern:
  // an effect would trip react-hooks/set-state-in-effect.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Escape closes; lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Opener — vertically centered in the (shrinking) header bar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        aria-expanded={open}
        className="absolute top-1/2 left-4 grid size-11 -translate-y-1/2 place-items-center rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        <span aria-hidden className="flex w-[18px] flex-col items-start gap-[5px]">
          <span className="h-[1.5px] w-full rounded-full bg-foreground/85" />
          <span className="h-[1.5px] w-3/4 rounded-full bg-foreground/85" />
          <span className="h-[1.5px] w-full rounded-full bg-foreground/85" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-background/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="เมนูหลัก"
              initial={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-[60] flex w-72 max-w-[85vw] flex-col bg-card/85 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div>
                  <p className="text-brand font-sans text-xs font-medium">เมนู</p>
                  <p className="font-display text-xl text-headings">
                    Rainbow Stream
                  </p>
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  aria-label="ปิดเมนู"
                  className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-shade hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 16 16"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M3 3l10 10M13 3L3 13" />
                  </svg>
                </button>
              </div>

              <div
                aria-hidden
                className="spectral-rule animate-spectrum-flow h-px opacity-60"
              />

              <motion.nav
                initial="hidden"
                animate="show"
                variants={{
                  show: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
                  },
                }}
                className="flex-1 overflow-y-auto p-3"
              >
                <ul className="space-y-1">
                  {ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <motion.li
                        key={item.href}
                        variants={{
                          hidden: { opacity: 0, x: -12 },
                          show: {
                            opacity: 1,
                            x: 0,
                            transition: {
                              duration: 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            },
                          },
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans font-medium transition-colors duration-200",
                            active
                              ? "bg-accent/70 text-accent-foreground ring-1 ring-decoration/15 ring-inset"
                              : "text-foreground hover:bg-shade",
                          )}
                        >
                          <span
                            aria-hidden
                            className="grid size-10 place-items-center rounded-xl bg-accent/60 text-lg ring-1 ring-decoration/10 ring-inset"
                          >
                            {item.icon}
                          </span>
                          {item.label}
                          {active && (
                            <span
                              aria-hidden
                              className="spectral-rule ml-auto size-1.5 rounded-full"
                            />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.nav>

              <div className="px-5 pb-5">
                <div aria-hidden className="spectral-rule h-px opacity-40" />
                <p className="mt-3 text-center font-sans text-xs text-muted-foreground">
                  Rainbow Stream · ลำธารสีรุ้ง
                </p>
              </div>

              {/* Spectral hairline on the drawer's leading edge */}
              <div
                aria-hidden
                className="spectral-rule absolute inset-y-0 right-0 w-px opacity-70"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
