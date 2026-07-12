"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem<K extends string> {
  key: K;
  label: ReactNode;
}

/**
 * Headless-leaning segmented tablist. Owns the ARIA tabs contract — roving
 * tabindex, ArrowLeft/ArrowRight with focus follow, and (via `idBase`) the
 * tab/tabpanel id wiring — while the skin comes from the caller through
 * `className`, `tabClassName`, and `activeBackdrop`. Columns size themselves
 * to the number of tabs.
 */
export function TabList<K extends string>({
  tabs,
  value,
  onChange,
  idBase,
  className,
  tabClassName,
  activeBackdrop,
  "aria-label": ariaLabel,
}: {
  tabs: readonly TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  /** When set, tabs get `id`/`aria-controls` wired to
   *  `${idBase}-tab-*` / `${idBase}-tabpanel-*` — give the panel the
   *  matching id and `aria-labelledby`. */
  idBase?: string;
  "aria-label"?: string;
  className?: string;
  /** Per-tab classes, given whether that tab is active. */
  tabClassName: (active: boolean) => string;
  /** Rendered inside the active tab behind its label — e.g. an animated
   *  pill. Pair it with a `relative` tab and an absolutely-positioned node. */
  activeBackdrop?: ReactNode;
}) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const moveFocus = (from: number, delta: number) => {
    const next = (from + delta + tabs.length) % tabs.length;
    onChange(tabs[next].key);
    buttonsRef.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("grid auto-cols-fr grid-flow-col gap-1 p-1", className)}
    >
      {tabs.map((t, i) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            ref={(el) => {
              buttonsRef.current[i] = el;
            }}
            type="button"
            role="tab"
            id={idBase ? `${idBase}-tab-${t.key}` : undefined}
            aria-selected={active}
            aria-controls={idBase ? `${idBase}-tabpanel-${t.key}` : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.key)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              moveFocus(i, e.key === "ArrowLeft" ? -1 : 1);
            }}
            className={tabClassName(active)}
          >
            {active && activeBackdrop}
            <span className="relative flex items-center justify-center gap-2">
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
