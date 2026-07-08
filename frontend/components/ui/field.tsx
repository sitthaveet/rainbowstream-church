import { cn } from "@/lib/cn";

/** Label + control + error/hint wrapper for form fields. */
export function Field({
  label,
  sublabel,
  required = false,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  /** Secondary label (e.g. an English gloss) shown under the main label. */
  sublabel?: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block">
        <span className="font-sans text-sm font-medium text-foreground/90">
          {label}
          {required && <span className="text-decoration"> *</span>}
        </span>
        {sublabel && (
          <span className="block font-sans text-xs font-normal text-muted-foreground">
            {sublabel}
          </span>
        )}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-sm text-error-foreground">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-sm text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
