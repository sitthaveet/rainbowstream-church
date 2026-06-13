import { cn } from "@/lib/cn";

/** Label + control + error/hint wrapper for form fields. */
export function Field({
  label,
  required = false,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block font-sans text-sm text-foreground">
        {label}
        {required && <span className="text-decoration"> *</span>}
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
