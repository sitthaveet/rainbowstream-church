import { cn } from "@/lib/cn";

/** Inline spinner (e.g. inside buttons) — inherits currentColor. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin text-current", className ?? "size-5")}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="กำลังโหลด"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/** A spinning spectral ring, masked hollow — the page-level loading state. */
export function SpectralRing({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="กำลังโหลด"
      className={cn("animate-spin rounded-full", className ?? "size-10")}
      style={{
        background: "var(--gradient-conic)",
        WebkitMask:
          "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
        mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
      }}
    />
  );
}

/** Full-area centered spinner for page-level loading states. */
export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
      <SpectralRing className="size-10" />
      {label && <p className="font-sans text-sm">{label}</p>}
    </div>
  );
}
